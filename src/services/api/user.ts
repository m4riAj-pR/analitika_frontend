import { request } from "./client";

export const getProfile = () =>
  request("/analitika/auth/me");

export const updateProfile = (data: any) =>
  request("/analitika/auth/update-profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const userApi = {
  getAll,
  create,
  update,
  remove,
};

