import { request } from "./client";

export const getAll = () =>
  request("/analitika/channels");

export const create = (data: any) =>
  request("/analitika/channels", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const update = (id: number, data: any) =>
  request(`/analitika/channels/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const remove = (id: number) =>
  request(`/analitika/channels/${id}`, {
    method: "DELETE",
  });

export const channelsApi = {
  getAll,
  create,
  update,
  remove,
};

