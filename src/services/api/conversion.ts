import { request } from "./client";

export const getAll = () =>
  request("/analitika/conversions");

export const create = (data: any) =>
  request("/analitika/conversions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/conversions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/conversions/${id}`, {
    method: "DELETE",
  });

export const conversionApi = {
  getAll,
  create,
  update,
  remove,
};

