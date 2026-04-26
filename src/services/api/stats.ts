import { request } from "./client";

export const getMetricas = (id_campaign: number) =>
  request(`/analitika/stats/${id_campaign}`);

export const getClicsPorDia = (id_campaign: number) =>
  request(`/analitika/stats/${id_campaign}/clics-por-dia`);

export const getTablaClic = (id_campaign: number) =>
  request(`/analitika/stats/${id_campaign}/tabla-clics`);

export const statsApi = {
  getMetricas,
  getClicsPorDia,
  getTablaClic,
};

export const trackingStatsApi = {
  getStats: getMetricas, // Alias commonly used in the app
  ...statsApi,
};
