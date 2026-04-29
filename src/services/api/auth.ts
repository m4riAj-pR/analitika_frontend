import { getUser, removeToken, request, saveToken, saveUser } from "./client";

export const loginUser = async (emailOrData: any, password?: string) => {
  const email = typeof emailOrData === "object" ? emailOrData.email : emailOrData;
  const pass  = typeof emailOrData === "object" ? emailOrData.password : password || "";

  const res: any = await request("/login", {
    method: "POST",
    body: JSON.stringify({ email, password: pass }),
  });

  await saveToken(res.access_token);
  await saveUser(res.user);
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
    }),
  });

  await saveToken(res.access_token);
  await saveUser(res.user);
  return res;
};

export const me = async () => {
  return await getUser();
};

export const logoutUser = async () => {
  await removeToken();
};

export const authApi = {
  register: registerUser,
  login:    loginUser,
  logout:   logoutUser,
  me,
};
