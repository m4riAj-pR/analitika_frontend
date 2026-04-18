// src/services/api/campaign.ts
import { request } from './client';
import type { Campaign, CampaignPayload, TopCampaign } from './types';

export const campaignsApi = {
  list: () => request<Campaign[]>('/campaigns', { method: 'GET' }),

  create: (payload: CampaignPayload) =>
    request<Campaign>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  update: (id_campaign: number, payload: CampaignPayload) =>
    request<Campaign>(`/campaigns/${id_campaign}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  top: (start_date: string, end_date: string) =>
    request<TopCampaign[]>(
      `/campaigns/top?start_date=${encodeURIComponent(start_date)}&end_date=${encodeURIComponent(end_date)}`,
      { method: 'GET' }
    ),
};