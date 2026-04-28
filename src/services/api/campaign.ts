import { request } from "./client";

const BASE = "/analitika/campaigns";

export const getCampaigns = () => {
  console.log("CAMPAIGNS REQUEST:", BASE);
  return request(BASE);
};

export const getTopCampaigns = () => {
  const endpoint = `${BASE}/top`;
  console.log("CAMPAIGNS REQUEST:", endpoint);
  return request(endpoint);
};

export const createCampaign = (data: any) => {
  console.log("CAMPAIGNS REQUEST:", BASE);
  console.log("CAMPAIGN PAYLOAD:", data);
  return request(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateCampaign = (id: number | string, data: any) => {
  const endpoint = `${BASE}/${id}`;
  console.log("CAMPAIGNS REQUEST:", endpoint);
  console.log("CAMPAIGN PAYLOAD:", data);
  return request(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const deleteCampaign = (id: number | string) => {
  const endpoint = `${BASE}/${id}`;
  console.log("CAMPAIGNS REQUEST:", endpoint);
  return request(endpoint, {
    method: "DELETE",
  });
};

export const campaignsApi = {
  getAll: getCampaigns,
  list: getCampaigns,
  getTop: getTopCampaigns,
  create: createCampaign,
  update: updateCampaign,
  remove: deleteCampaign,
};
