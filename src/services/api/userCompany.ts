import { request } from "./client";

export const getUserCompanies = () =>
  request("/analitika/user-company");

export const createUserCompany = (data: any) =>
  request("/analitika/user-company", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUserCompany = (id: number, data: any) =>
  request(`/analitika/user-company/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUserCompany = (id: number) =>
  request(`/analitika/user-company/${id}`, {
    method: "DELETE",
  });

export const userCompanyApi = {
  getUserCompanies,
  createUserCompany,
  updateUserCompany,
  deleteUserCompany,
};

