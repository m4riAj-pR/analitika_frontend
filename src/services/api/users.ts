import { request } from "./client";

export const getUsers = () =>
  request("/analitika/persons");

export const createUser = (data: any) =>
  request("/analitika/persons", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUser = (id: number, data: any) =>
  request(`/analitika/persons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUser = (id: number) =>
  request(`/analitika/persons/${id}`, {
    method: "DELETE",
  });

export const usersApi = {
  getAll: getUsers,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};

export const getAll = getUsers;

