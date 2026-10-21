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
  budget?: number | string | null;
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

/**
 * Fila de GET /analitika/campaigns/top. El backend devuelve `clics` y, solo para
 * Owner/Super Admin, `ingresos`, `spent` y `beneficio` (a Manager se le filtran).
 * `roi` se calcula en el cliente a partir de beneficio / spent.
 */
export interface TopCampaign {
  id_campaign: number;
  name: string;
  clics: number;
  ingresos?: number | null;
  spent?: number | null;
  beneficio?: number | null;
  roi?: number | null;
  rankPosition?: number;
}

/** Métricas de GET /stats/{id_campaign}. Los campos financieros no llegan para Manager. */
export interface CampaignStats {
  clics: number;
  conversiones: number;
  conversion_rate: number;
  aov?: number;
  ingresos?: number;
  spent?: number;
  cpc?: number;
  cpa?: number;
  roi?: number;
  roas?: number;
}

export interface User {
  id_user: number;
  id_person: number;
  id_role: number;
  id_company?: number | null;
  company_name?: string | null;
  role_name?: string;
  email: string;
  name?: string;
  first_name?: string; // backward-compat fallback from API
  phone?: string | null;
  companies?: { id_company: number; name: string }[];
}

export interface Company {
  id_company: number;
  name: string;
  tax_id: string;
  is_active: boolean;
}

// ── Predicción de ROI a 7 días ────────────────────────────────────────────

/** Respuesta de GET /analitika/campaigns/{id}/predict. El ROI viene como razón (0,35 = 35 %). */
export interface CampaignPrediction {
  id_campaign: number;
  predicted_roi_7d: number;
  predicted_roi_7d_pct: string;
  observation_window_hours: number;
  hours_of_data_available: number;
  has_full_observation_window: boolean;
  low_confidence_warning: string | null;
  dataset_warning: string | null;
  model_artifact: string;
  model_version: number | null;
}

/** Canales que acepta el simulador (Meta se excluye: la integración fue retirada). */
export const SCENARIO_CHANNELS = ['Google', 'WhatsApp', 'Email', 'TikTok'] as const;
export type ScenarioChannel = typeof SCENARIO_CHANNELS[number];

export interface ScenarioInput {
  channel: ScenarioChannel;
  spend_48h: number;
  clicks_48h: number;
  conversions_48h: number;
  revenue_48h: number;
}

export type StrategicRecommendation = 'Escalar presupuesto' | 'Mantener y monitorear' | 'Optimizar o pausar';

/** Respuesta de POST /api/v1/campaigns/predict-roi. */
export interface ScenarioPrediction {
  predicted_roi_7d: number;
  estimated_revenue_7d: number;
  strategic_recommendation: StrategicRecommendation;
  status: string;
}
