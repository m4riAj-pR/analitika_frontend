import { request } from "./client";

const BASE = "/analitika/role-permissions";

export const getRolePermissions = () =>
  request(BASE);

export const createRolePermission = (data: any) =>
  request(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Note: Backend only has GET, POST, DELETE for role-permissions (no PUT)
export const deleteRolePermission = (id: number | string) =>
  request(`${BASE}/${id}`, {
    method: "DELETE",
  });

export const rolePermissionsApi = {
  getAll: getRolePermissions,
  getRolePermissions,
  createRolePermission,
  deleteRolePermission,
};

export const getAll = getRolePermissions;
