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
  data_source?: 'api_meta' | 'manual' | string;
  impressions?: number;
  ctr_real?: number;
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
  clics?: number; // fallback resilience
  conversions: number;
  conversiones?: number; // fallback resilience
  roi: number;
  ingresos?: number;
  roas?: number;
  cpa?: number;
  data_source?: 'api_meta' | 'manual' | string;
  impressions?: number;
  ctr_real?: number;
}

export interface User {
  id_user: number;
  id_person: number;
  id_role: number;
  id_company: number;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone: string;
  is_active: boolean;
}

export interface Company {
  id_company: number;
  name: string;
  tax_id: string;
  is_active: boolean;
}

export interface AdConnection {
  id_connection: number;
  id_company: number;
  provider: 'meta' | string;
  external_account_id: string;
  account_name: string;
  status: 'active' | 'expired' | 'revoked' | 'error';
  status_message?: string | null;
  connected_by?: number;
  connected_at: string;
  last_sync_at?: string | null;
}

export interface OAuthConnectResponse {
  auth_url: string;
  provider: string;
  state: string;
}

export interface ExternalCampaignItem {
  id: string;
  name: string;
  status?: string;
  objective?: string;
}

export interface CampaignExternalMapping {
  id_mapping: number;
  id_campaign: number;
  id_connection: number;
  provider: string;
  external_account_id: string;
  external_campaign_id: string;
  external_campaign_name?: string | null;
  sync_enabled: boolean;
  created_at?: string;
  last_sync_at?: string | null;
}

export interface CampaignExternalMetric {
  id_metric: number;
  id_mapping: number;
  metric_date: string;
  impressions: number;
  spend: number;
  clicks: number;
  synced_at: string;
}

