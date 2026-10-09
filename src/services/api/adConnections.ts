// src/services/api/adConnections.ts
import { request } from "./client";
import type {
  AdConnection,
  OAuthConnectResponse,
  ExternalCampaignItem,
  CampaignExternalMapping,
  CampaignExternalMetric,
} from "./types";

export const getCompanyAdConnections = (id_company: number): Promise<AdConnection[]> => {
  return request(`/analitika/companies/${id_company}/ad-connections`);
};

export const startMetaConnect = (id_company: number): Promise<OAuthConnectResponse> => {
  return request(`/analitika/companies/${id_company}/ad-connections/meta/connect`, {
    method: "POST",
  });
};

export const disconnectAdConnection = (
  id_company: number,
  id_connection: number
): Promise<{ ok: boolean; message: string }> => {
  return request(`/analitika/companies/${id_company}/ad-connections/${id_connection}`, {
    method: "DELETE",
  });
};

export const triggerSync = (
  id_company: number,
  id_connection: number
): Promise<any> => {
  return request(`/analitika/companies/${id_company}/ad-connections/${id_connection}/sync`, {
    method: "POST",
  });
};

export const getExternalCampaigns = (
  id_company: number,
  id_connection: number
): Promise<ExternalCampaignItem[]> => {
  return request(
    `/analitika/companies/${id_company}/ad-connections/${id_connection}/campaigns`
  );
};

export const mapCampaignToExternal = (
  id_campaign: number,
  data: {
    id_connection: number;
    external_campaign_id: string;
    external_campaign_name?: string;
  }
): Promise<CampaignExternalMapping> => {
  return request(`/analitika/campaigns/${id_campaign}/map-external`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const getCampaignExternalMapping = (
  id_campaign: number
): Promise<CampaignExternalMapping | null> => {
  return request(`/analitika/campaigns/${id_campaign}/external-mapping`);
};

export const deleteCampaignExternalMapping = (
  id_campaign: number
): Promise<{ ok: boolean; message: string }> => {
  return request(`/analitika/campaigns/${id_campaign}/map-external`, {
    method: "DELETE",
  });
};

export const getCampaignExternalMetrics = (
  id_campaign: number
): Promise<CampaignExternalMetric[]> => {
  return request(`/analitika/campaigns/${id_campaign}/external-metrics`);
};

export const adConnectionsApi = {
  getCompanyConnections: getCompanyAdConnections,
  list: getCompanyAdConnections,
  connectMeta: startMetaConnect,
  disconnect: disconnectAdConnection,
  sync: triggerSync,
  getExternalCampaigns,
  mapExternal: mapCampaignToExternal,
  getMapping: getCampaignExternalMapping,
  deleteMapping: deleteCampaignExternalMapping,
  getMetrics: getCampaignExternalMetrics,
};
