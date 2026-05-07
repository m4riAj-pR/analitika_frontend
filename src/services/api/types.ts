// src/services/api/types.ts

export type ApiError = {
  message: string;
  status?: number;
  details?: any;
};

// Valores de estado válidos según el ENUM del backend
export const CAMPAIGN_STATUS = ['draft', 'active', 'paused', 'finished'] as const;
export type CampaignStatus = typeof CAMPAIGN_STATUS[number];

export interface Campaign {
  id_campaign: number | null;
  id_company: number;
  name: string;
  description: string | null;
  status: CampaignStatus;
  start_date: string | null;
  end_date: string | null;
  spent: number | string | null;
}

export interface TrackingLink {
  id_link: number;
  id_campaign: number;   // relación: tracking_link → campaign
  id_channel: number | null; // relación: tracking_link → channel
  destination: string;
  created_at: string;
}

// Channel es independiente de campaigns.
// La relación campaign ↔ channel pasa ÚNICAMENTE por tracking_links.
export interface Channel {
  id_channel: number;
  name: string;
  description: string | null;
}

// Payload de creación: NUNCA incluye id_campaign
export interface ChannelPayload {
  name: string;
  description: string | null;
}

export interface TopCampaign {
  id_campaign: number;
  name: string;
  clicks: number;
  conversions: number;
  roi: number;
}

export interface User {
  id_user: number;
  id_person: number;
  id_role: number;
  id_company: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
}

export interface Company {
  id_company: number;
  name: string;
  tax_id: string;
  is_active: boolean;
}

