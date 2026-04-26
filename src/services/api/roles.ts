import { request } from "./client";

export const getRoles = () =>
  request("/analitika/roles");

export const createRole = (data: any) =>
  request("/analitika/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateRole = (id: number, data: any) =>
  request(`/analitika/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteRole = (id: number) =>
  request(`/analitika/roles/${id}`, {
    method: "DELETE",
  });

export const rolesApi = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
};

