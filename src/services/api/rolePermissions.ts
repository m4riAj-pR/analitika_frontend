import { request } from "./client";

export const getAll = () =>
  request("/analitika/role-permissions");

export const create = (data: any) =>
  request("/analitika/role-permissions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/role-permissions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/role-permissions/${id}`, {
    method: "DELETE",
  });

export const rolePermissionsApi = {
  getAll,
  create,
  update,
  remove,
};

