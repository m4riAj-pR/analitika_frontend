import { request } from "./client";

export const getClicks = () =>
  request("/analitika/clicks");

export const createClick = (data: any) =>
  request("/analitika/clicks", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateClick = (id: number, data: any) =>
  request(`/analitika/clicks/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteClick = (id: number) =>
  request(`/analitika/clicks/${id}`, {
    method: "DELETE",
  });

export const clicksApi = {
  getClicks,
  createClick,
  updateClick,
  deleteClick,
};

