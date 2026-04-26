import { request } from "./client";

export const list = () =>
  request("/analitika/campaigns");

export const campaignsApi = {
  list,
  getAll: list,
  create: (data: any) =>
    request("/analitika/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: number, data: any) =>
    request(`/analitika/campaigns/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id: number) =>
    request(`/analitika/campaigns/${id}`, {
      method: "DELETE",
    }),
};
