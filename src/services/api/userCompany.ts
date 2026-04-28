import { request } from "./client";

const BASE = "/analitika/user-company";

export const getUserCompanies = () =>
  request(BASE);

export const createUserCompany = (data: any) =>
  request(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });

// Note: Backend only has GET, POST, DELETE for user-company (no PUT)
export const deleteUserCompany = (id: number | string) =>
  request(`${BASE}/${id}`, {
    method: "DELETE",
  });

export const userCompanyApi = {
  getAll: getUserCompanies,
  getUserCompanies,
  createUserCompany,
  deleteUserCompany,
};

export const getAll = getUserCompanies;
