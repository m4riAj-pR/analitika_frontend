import { request } from "./client";

const BASE = "/analitika/conversions";

export const getConversions = () =>
  request(BASE);

export const createConversion = (data: any) =>
  request(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateConversion = (id: number | string, data: any) =>
  request(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteConversion = (id: number | string) =>
  request(`${BASE}/${id}`, {
    method: "DELETE",
  });

// Export as both conversionApi (legacy) and conversionsApi (consistent naming)
export const conversionApi = {
  getAll: getConversions,
  getConversions,
  createConversion,
  updateConversion,
  deleteConversion,
};

export const conversionsApi = conversionApi;

export const getAll = getConversions;
