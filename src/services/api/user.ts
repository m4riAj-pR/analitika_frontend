import { request } from "./client";

export const getProfile = (id: number) =>
  request(`/analitika/users/${id}`);

export const updateProfile = (id: number, data: any) =>
  request(`/analitika/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const userApi = {
  getProfile,
  updateProfile,
};

