import { request } from "./client";

export const getUsers = () =>
  request("/analitika/users");

export const createUser = (data: any) =>
  request("/analitika/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUser = (id: number, data: any) =>
  request(`/analitika/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUser = (id: number) =>
  request(`/analitika/users/${id}`, {
    method: "DELETE",
  });

export const usersApi = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};

