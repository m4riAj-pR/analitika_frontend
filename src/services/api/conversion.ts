// src/services/api/conversions.ts
import { request } from './client';
import type { Conversion, ConversionPayload } from './types';

export const conversionsApi = {
  create: (payload: ConversionPayload) =>
    request<Conversion>('/conversions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listByCampaign: (id_campaign: number) =>
    request<Conversion[]>(`/conversions/${id_campaign}`, { method: 'GET' }),
};