
import type { Campaign, TopCampaign, TrackingLink } from '../services/api/types';

export const DEMO_CAMPAIGNS: Campaign[] = [];
export const DEMO_TOP_CAMPAIGNS: TopCampaign[] = [];
export const DEMO_TRACKING_LINKS: Record<number, TrackingLink[]> = {};
export const DEMO_METRICAS: Record<number, { clics: number; conversiones: number; cpc: number; roi: number }> = {};
export const DEMO_CLICS_POR_DIA: Record<number, { day: string; clics: number }[]> = {};
export const DEMO_TABLA_CLICS: Record<number, { fecha: string; hora: string; pais: string }[]> = {};

/** Indica si un id de campaña es de demo */
export const isDemoId = (id: number) => false;
