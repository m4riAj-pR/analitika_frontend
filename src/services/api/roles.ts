import { request } from "./client";

export const getAll = () =>
  request("/analitika/roles");

export const create = (data: any) =>
  request("/analitika/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/roles/${id}`, {
    method: "DELETE",
  });

export const rolesApi = {
  getAll,
  create,
  update,
  remove,
};

