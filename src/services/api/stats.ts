import { request } from './client';
import type { CampaignMetrics, DashboardResponse } from './types';

export const metricsApi = {
  getByCampaign: (id_campaign: number) => request<CampaignMetrics>(`/metrics/${id_campaign}`),
};

export const dashboardApi = {
  getSummary: () => request<DashboardResponse>('/dashboard'),
};

export const trackingStatsApi = {
  registrarClick: (id_link: number) => request(`/tracking/click/${id_link}`, { method: 'POST' }),
  getStats: (id_campaign: number) => request(`/tracking/stats/${id_campaign}`, { method: 'GET' }),
};