import { request } from "./client";

// Endpoints de estadísticas alineados con el backend
export const getMetricas = (id_campaign: number) =>
  request(`/stats/${id_campaign}`);

export const getClicsPorDia = (id_campaign: number) =>
  request(`/stats/${id_campaign}/clics-por-dia`);

export const getTablaClic = (id_campaign: number) =>
  request(`/stats/${id_campaign}/tabla-clics`);

// NOTA: No usar registrarClick manualmente; el endpoint /c/{id} ya registra
// el click automáticamente al redirigir.

export const statsApi = {
  getMetricas,
  getClicsPorDia,
  getTablaClic,
};

export const trackingStatsApi = {
  getStats: getMetricas,
  ...statsApi,
};
