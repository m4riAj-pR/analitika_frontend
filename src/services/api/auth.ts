import { getUser, getToken, removeToken, request, saveToken, saveUser } from "./client";
import { Alert } from "react-native";

export const loginUser = async (emailOrData: any, password?: string) => {
  const email = typeof emailOrData === "object" ? emailOrData.email : emailOrData;
  const pass  = typeof emailOrData === "object" ? emailOrData.password : password || "";

  const res: any = await request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password: pass }),
  });

  // Guardar token
  await saveToken(res.access_token);

  // Extraer id_company de la respuesta (primer empresa)
  let userToSave = res.user || res;
  if (userToSave && Array.isArray(userToSave.companies) && userToSave.companies.length > 0) {
    const companyId = userToSave.companies[0].id_company;
    const companyName = userToSave.companies[0].name;
    userToSave = { ...userToSave, id_company: companyId, company_name: companyName };
  }
  // Guardar usuario con id_company
  await saveUser(userToSave);
  console.log('Login response (augmented):', userToSave);

  return res;
};

export const registerUser = async (data: any) => {
  const res: any = await request("/register", {
    method: "POST",
    body: JSON.stringify({
      email:      data.email.trim(),
      password:   data.password,
      first_name: data.first_name || "",
      last_name:  data.last_name  || "",
      phone:      data.phone      || "",
      company:    data.company    || "",
    }),
  });

  await saveToken(res.access_token);

  let userToSave = res.user || res;
  if (userToSave && Array.isArray(userToSave.companies) && userToSave.companies.length > 0) {
    const companyId = userToSave.companies[0].id_company;
    const companyName = userToSave.companies[0].name;
    userToSave = { ...userToSave, id_company: companyId, company_name: companyName };
  }
  await saveUser(userToSave);

  return res;
};

export const me = async () => {
  try {
    const token = await getToken();
    if (!token) return null;

    const res: any = await request("/me");
    if (res) {
      await saveUser(res);
    }
    return res;
  } catch (err: any) {
    if (err?.status !== 401) {
      Alert.alert("Error", "No se pudo actualizar la información del perfil.");
    }
    return await getUser(); // Fallback to cache
  }
};

export const logoutUser = async () => {
  await removeToken();
};

// CORRECCIÓN 1: actualizar persona por id_person del usuario actual
export const updateProfile = async (idPerson: number, data: {
  name?: string;
  lastname?: string;
  email?: string;
  phone?: string;
}) => {
  return await request(`/analitika/persons/${idPerson}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const forgotPassword = async (email: string) => {
  return await request("/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

export const authApi = {
  register: registerUser,
  login:    loginUser,
  logout:   logoutUser,
  updateProfile,
  forgotPassword,
  me,
  saveUser,
};
