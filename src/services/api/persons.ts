import { request } from "./client";

export const getAll = () =>
  request("/analitika/persons");

export const create = (data: any) =>
  request("/analitika/persons", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/persons/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/persons/${id}`, {
    method: "DELETE",
  });

export const personsApi = {
  getAll,
  create,
  update,
  remove,
};

