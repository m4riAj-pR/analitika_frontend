import { getUser, getToken, removeToken, request, saveToken, saveUser } from "./client";

/**
 * El backend devuelve las empresas como `companies: [{ id_company, name }]` y no envía
 * `id_company` ni `company_name`. Se derivan aquí para que toda la app (perfil, creación
 * de campañas, equipo) lea la empresa del mismo lugar, también después de refrescar /me.
 */
export function normalizeUser(raw: any) {
  if (!raw || typeof raw !== "object") return raw;
  const companies = Array.isArray(raw.companies)
    ? raw.companies.filter(Boolean).map((c: any) => ({ id_company: Number(c.id_company), name: c.name }))
    : [];
  const primary = companies[0];
  return {
    ...raw,
    companies,
    id_company: raw.id_company ?? primary?.id_company ?? null,
    company_name: primary?.name ?? raw.company_name ?? null,
  };
}

export const loginUser = async (emailOrData: any, password?: string) => {
  const email = typeof emailOrData === "object" ? emailOrData.email : emailOrData;
  const pass  = typeof emailOrData === "object" ? emailOrData.password : password || "";

  const res: any = await request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password: pass }),
  });

  // Guardar token
  await saveToken(res.access_token);

  const userToSave = normalizeUser(res.user || res);
  await saveUser(userToSave);

  return { ...res, user: userToSave };
};

export const registerUser = async (data: any) => {
  const res: any = await request("/register", {
    method: "POST",
    body: JSON.stringify({
      email:      data.email.trim(),
      password:   data.password,
      first_name: data.first_name || data.name || "",
      name:       data.name || data.first_name || "",
      phone:      data.phone      || "",
      company:    data.company    || "",
    }),
  });

  await saveToken(res.access_token);

  const userToSave = normalizeUser(res.user || res);
  await saveUser(userToSave);

  return { ...res, user: userToSave };
};

export const me = async () => {
  try {
    const token = await getToken();
    if (!token) return null;

    const res: any = await request("/me");
    if (!res) return null;
    const user = normalizeUser(res);
    await saveUser(user);
    return user;
  } catch (err: any) {
    // 401: el cliente ya limpió la sesión. Otros errores (red): se usa la caché local.
    if (err?.status === 401) return null;
    return normalizeUser(await getUser());
  }
};

export const logoutUser = async () => {
  await removeToken();
};

// CORRECCIÓN 1: actualizar persona por id_person del usuario actual
export const updateProfile = async (idPerson: number, data: {
  name?: string;
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
