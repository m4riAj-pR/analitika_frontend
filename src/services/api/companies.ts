import { request } from "./client";

export const getCompanies = () =>
  request("/analitika/companies");

export const createCompany = (data: any) =>
  request("/analitika/companies", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCompany = (id: number, data: any) =>
  request(`/analitika/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteCompany = (id: number) =>
  request(`/analitika/companies/${id}`, {
    method: "DELETE",
  });

export const companiesApi = {
  getAll: getCompanies,
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
};

export const getAll = getCompanies;

