import { request } from "./client";

const BASE = "/analitika/campaigns";

/** El backend filtra las campañas por las empresas del usuario autenticado. */
export const getCampaigns = () => request(BASE);

export const getTopCampaigns = (limit = 10) => request(`${BASE}/top?limit=${limit}`);

export const createCampaign = (data: any) =>
  request(BASE, { method: "POST", body: JSON.stringify(data) });

export const updateCampaign = (id: number | string, data: any) =>
  request(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteCampaign = (id: number | string) =>
  request(`${BASE}/${id}`, { method: "DELETE" });

export const campaignsApi = {
  getAll: getCampaigns,
  list: getCampaigns,
  getTop: getTopCampaigns,
  create: createCampaign,
  update: updateCampaign,
  remove: deleteCampaign,
};
