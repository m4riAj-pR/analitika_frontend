import { removeToken, request, saveToken, saveUser, getUser } from "./client";

/**
 * Registro de usuario usando CRUD en dos pasos:
 * 1. Crear persona en /analitika/persons
 * 2. Crear usuario en /analitika/users vinculado a la persona
 */
export const registerUser = async (data: any) => {
  console.log("REGISTER USER START", data);
  // 0. Verificar si el email ya existe
  console.log("FETCHING PERSONS");
  const persons: any[] = await request("/analitika/persons");
  const existingPerson = persons.find((p: any) => p.email?.toLowerCase() === data.email.trim().toLowerCase());
  console.log("EXISTING PERSON", existingPerson);

  if (existingPerson) {
    const users: any[] = await request("/analitika/users");
    const hasUser = users.some(
      (u: any) => Number(u.id_person) === Number(existingPerson.id_person)
    );

    if (!hasUser) {
      throw { message: "Este correo ya existe pero el registro está incompleto. Contacta soporte o elimina el registro.", status: 400 };
    } else {
      throw { message: "Este correo ya está registrado.", status: 400 };
    }
  }

  // PASO 0.5: Crear empresa
  console.log("CREATING COMPANY", data.company);
  let id_company = 1; // Default
  if (data.company) {
    try {
      let companyRes: any = await request("/analitika/companies", {
        method: "POST",
        body: JSON.stringify({ name: data.company }),
      });

      if (!companyRes || !companyRes.id_company) {
        console.log("COMPANY CREATION SUCCESS BUT NO ID RETURNED, SEARCHING BY NAME...");
        const allCompanies: any[] = await request("/analitika/companies");
        const found = allCompanies.find((c: any) => c.name?.toLowerCase() === data.company.toLowerCase());
        if (found) id_company = found.id_company;
      } else {
        id_company = companyRes.id_company;
      }
    } catch (error) {
      console.log("Error creating company, using default ID 1", error);
    }
  }
  console.log("USING ID_COMPANY:", id_company);

  // PASO 1: Crear persona
  console.log("CREATING PERSON");
  let person: any;
  try {
    person = await request("/analitika/persons", {
      method: "POST",
      body: JSON.stringify({
        name: data.first_name,
        lastname: data.last_name,
        email: data.email,
        phone: data.phone,
      }),
    });
  } catch (error: any) {
    console.log("ERROR REAL creando person:", error);

    throw {
      message: error?.message || "Error al crear el perfil de persona",
      status: error?.status || 500,
      details: error,
    };
  }

  if (!person || !person.id_person) {
    // Si el backend devolvió {"ok":true} pero no el ID, lo buscamos de nuevo por email
    console.log("PERSON CREATION SUCCESS BUT NO ID RETURNED, SEARCHING BY EMAIL...");
    const allPersons: any[] = await request("/analitika/persons");
    person = allPersons.find((p: any) => p.email?.toLowerCase() === data.email.trim().toLowerCase());
  }

  if (!person || !person.id_person) {
    throw { message: "No se pudo obtener el ID de la persona creada", status: 500 };
  }

  console.log("PERSON FOUND/CREATED WITH ID:", person.id_person);

  // PASO 2: Crear usuario vinculado a la persona y empresa
  console.log("CREATING USER");
  const userBody = {
    id_person: Number(person.id_person),
    id_company: Number(id_company),
    id_role: 2,
    password_hash: data.password,
  };
  console.log("USER REQUEST BODY", userBody);

  let user: any;
  try {
    user = await request("/analitika/users", {
      method: "POST",
      body: JSON.stringify(userBody),
    });

    if (!user || !user.id_user) {
      console.log("USER CREATION SUCCESS BUT NO ID RETURNED, SEARCHING BY PERSON_ID...");
      const allUsers: any[] = await request("/analitika/users");
      user = allUsers.find((u: any) => Number(u.id_person) === Number(person.id_person));
    }

    if (user && user.id_user) {
      console.log("USER FOUND/CREATED WITH ID:", user.id_user);
      
      // PASO 3: Vincular en user-company
      console.log("LINKING USER TO COMPANY", { id_user: user.id_user, id_company });
      try {
        await request("/analitika/user-company", {
          method: "POST",
          body: JSON.stringify({
            id_user: Number(user.id_user),
            id_company: Number(id_company),
          }),
        });
        console.log("USER-COMPANY LINK CREATED");
      } catch (linkError) {
        console.log("Error linking user-company, maybe already exists or endpoint issues", linkError);
      }
    }

    await saveUser(user);
    return { person, user };

  } catch (error: any) {
    console.log("ERROR REAL creando user:", error);

    throw {
      message: error?.message || "Error al crear el usuario",
      status: error?.status || 500,
      details: error,
    };
  }
};

/**
 * Inicio de sesión temporal usando CRUD
 * 1. Buscar persona por email
 * 2. Buscar usuario por id_person
 * 3. Validar contraseña
 */
export const loginUser = async (emailOrData: any, password?: string) => {
  let email = "";
  let pass = "";

  if (typeof emailOrData === "object") {
    email = emailOrData.email;
    pass = emailOrData.password;
  } else {
    email = emailOrData;
    pass = password || "";
  }

  // 1. Hacer GET /analitika/persons
  const persons: any[] = await request("/analitika/persons");
  console.log("LOGIN persons:", persons.length);

  // 2. Buscar una person cuyo email coincida con el email ingresado, ignorando mayúsculas/minúsculas.
  const person = persons.find((p: any) => p.email?.toLowerCase() === email.trim().toLowerCase());

  // 3. Si no existe, lanzar Error("Usuario no encontrado")
  if (!person) {
    throw { message: "Usuario no encontrado", status: 404 };
  }

  // 4. Hacer GET /analitika/users
  const users: any[] = await request("/analitika/users");

  // 5. Buscar un user cuyo id_person coincida con person.id_person
  const user = users.find(
    (u: any) => Number(u.id_person) === Number(person.id_person)
  );

  // 6. Si no existe, lanzar Error("Usuario no registrado")
  if (!user) {
    throw { message: "Usuario no registrado", status: 404 };
  }

  console.log("LOGIN user found:", user);

  // 7. Comparar user.password_hash con password ingresada
  if (user.password_hash !== pass) {
    // 8. Si no coincide, lanzar Error("Credenciales inválidas")
    throw { message: "Credenciales inválidas", status: 401 };
  }

  // 9. Si coincide, devolver: { person, user }
  await saveToken("fake-jwt-token"); 
  await saveUser(user);
  return { person, user };
};

export const me = async () => {
  const user = await getUser();
  return user;
};

export const logoutUser = async () => {
  await removeToken();
  console.log("Logged out...");
};

export const authApi = {
  register: registerUser,
  login: loginUser,
  logout: logoutUser,
  me,
};
