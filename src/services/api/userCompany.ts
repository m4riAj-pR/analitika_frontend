import { request } from "./client";

export const getAll = () =>
  request("/analitika/user-company");

export const create = (data: any) =>
  request("/analitika/user-company", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/user-company/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/user-company/${id}`, {
    method: "DELETE",
  });

export const userCompanyApi = {
  getAll,
  create,
  update,
  remove,
};

