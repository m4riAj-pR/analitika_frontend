import { request } from "./client";


// These endpoints may not exist yet on the backend — kept as stubs
export const getMetricas = (id_campaign: number) =>
  request(`/analitika/clicks?campaign_id=${id_campaign}`);

export const getClicsPorDia = (id_campaign: number) =>
  request(`/analitika/clicks?campaign_id=${id_campaign}`);

export const getTablaClic = (id_campaign: number) =>
  request(`/analitika/clicks?campaign_id=${id_campaign}`);

export const registrarClick = (data: any) =>
  request("/analitika/clicks", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const statsApi = {
  getMetricas,
  getClicsPorDia,
  getTablaClic,
};

export const trackingStatsApi = {
  getStats: getMetricas,
  registrarClick,
  ...statsApi,
};
