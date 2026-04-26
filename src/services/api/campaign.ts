import { request } from "./client";

export const getCampaigns = () =>
  request("/analitika/campaigns");

export const createCampaign = (data: any) =>
  request("/analitika/campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateCampaign = (id: number, data: any) =>
  request(`/analitika/campaigns/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteCampaign = (id: number) =>
  request(`/analitika/campaigns/${id}`, {
    method: "DELETE",
  });

export const campaignsApi = {
  getCampaigns,
  getAll: getCampaigns,
  list: getCampaigns,
  create: createCampaign,
  update: updateCampaign,
  remove: deleteCampaign,
};
