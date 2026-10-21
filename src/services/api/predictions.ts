// src/services/api/predictions.ts
import { request } from './client';
import type { CampaignPrediction, ScenarioInput, ScenarioPrediction } from './types';

/** Proyección del ROI a 7 días con los datos reales de la campaña (solo Owner y Super Admin). */
export const getCampaignPrediction = (idCampaign: number) =>
  request<CampaignPrediction>(`/analitika/campaigns/${idCampaign}/predict`);

/** Simulador de escenarios: el backend exige sesión con rol Owner o Super Admin. */
export const simulateScenario = (input: ScenarioInput) =>
  request<ScenarioPrediction>('/api/v1/campaigns/predict-roi', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const predictionsApi = {
  getForCampaign: getCampaignPrediction,
  simulate: simulateScenario,
};
