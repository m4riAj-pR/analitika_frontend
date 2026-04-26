import { request } from "./client";

export const getMetricas = (id_campaign: number) =>
  request(`/analitika/stats/${id_campaign}`);

export const getClicsPorDia = (id_campaign: number) =>
  request(`/analitika/stats/${id_campaign}/clics-por-dia`);

export const getTablaClic = (id_campaign: number) =>
  request(`/analitika/stats/${id_campaign}/tabla-clics`);

export const registrarClick = (id_link: number) =>
  request(`/track/${id_link}`, { method: 'POST' });

export const getRanking = (start_date: string, end_date: string) =>
  request(`/analitika/stats/ranking?start_date=${start_date}&end_date=${end_date}`);

export const statsApi = {
  getMetricas,
  getClicsPorDia,
  getTablaClic,
  getRanking,
};

export const trackingStatsApi = {
  getStats: getMetricas, // Alias commonly used in the app
  registrarClick,
  ...statsApi,
};
