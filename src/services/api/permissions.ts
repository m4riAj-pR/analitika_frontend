import { request } from "./client";

export const getAll = () =>
  request("/analitika/permissions");

export const create = (data: any) =>
  request("/analitika/permissions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/permissions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/permissions/${id}`, {
    method: "DELETE",
  });

export const permissionsApi = {
  getAll,
  create,
  update,
  remove,
};

