// src/services/api/tracking.ts
import { request } from './client';
import { API_BASE_URL } from './config';
import type { TrackingLink, TrackingLinkPayload } from './types';

export const trackingLinksApi = {
  create: (payload: TrackingLinkPayload) =>
    request<TrackingLink>('/tracking-links', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listByCampaign: (id_campaign: number) =>
    request<TrackingLink[]>(`/tracking-links/${id_campaign}`, {
      method: 'GET',
    }),

  publicTrackUrl: (id_link: number) => `${API_BASE_URL}/track/${id_link}`,
};