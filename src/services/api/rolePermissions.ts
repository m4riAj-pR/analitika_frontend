import { request } from "./client";

export const getRolePermissions = () =>
  request("/analitika/role-permissions");

export const createRolePermission = (data: any) =>
  request("/analitika/role-permissions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateRolePermission = (id: number, data: any) =>
  request(`/analitika/role-permissions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteRolePermission = (id: number) =>
  request(`/analitika/role-permissions/${id}`, {
    method: "DELETE",
  });

export const rolePermissionsApi = {
  getRolePermissions,
  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
};

