import { request } from "./client";

export const getAll = () =>
  request("/analitika/companies");

export const create = (data: any) =>
  request("/analitika/companies", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/companies/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/companies/${id}`, {
    method: "DELETE",
  });

export const companiesApi = {
  getAll,
  create,
  update,
  remove,
};

