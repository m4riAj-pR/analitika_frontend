import { request, saveToken, removeToken } from "./client";

export const login = async (data: any) => {
  const response: any = await request("/analitika/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (response.token) {
    await saveToken(response.token);
  }
  return response;
};

export const register = (data: any) =>
  request("/analitika/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const me = () =>
  request("/analitika/auth/me");

export const logout = async () => {
  try {
    await request("/analitika/auth/logout", { method: "POST" });
  } finally {
    await removeToken();
  }
};

export const authApi = {
  login,
  register,
  me,
  logout,
};
