import { request } from "./client";

export const getAll = () =>
  request("/analitika/users");

export const create = (data: any) =>
  request("/analitika/users", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/users/${id}`, {
    method: "DELETE",
  });

export const usersApi = {
  getAll,
  create,
  update,
  remove,
};

