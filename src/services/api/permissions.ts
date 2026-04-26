import { request } from "./client";

export const getPermissions = () =>
  request("/analitika/permissions");

export const createPermission = (data: any) =>
  request("/analitika/permissions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updatePermission = (id: number, data: any) =>
  request(`/analitika/permissions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deletePermission = (id: number) =>
  request(`/analitika/permissions/${id}`, {
    method: "DELETE",
  });

export const permissionsApi = {
  getPermissions,
  createPermission,
  updatePermission,
  deletePermission,
};

