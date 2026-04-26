// src/services/api/types.ts

export type ApiError = {
  message: string;
  status?: number;
  details?: any;
};

// Puedes agregar aquí las interfaces para tus recursos si las conoces
export interface Campaign {
  id_campaign: number | null;
  id_company: number;
  name: string;
  description: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  spent: number | string | null;
}

export interface TrackingLink {
  id_link: number;
  id_campaign: number;
  original_url: string;
  track_url: string;
  created_at?: string;
}

export interface TopCampaign {
  id_campaign: number;
  name: string;
  clicks: number;
  conversions: number;
  roi: number;
}
