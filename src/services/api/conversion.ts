import { request } from "./client";

export const getConversions = () =>
  request("/analitika/conversions");

export const createConversion = (data: any) =>
  request("/analitika/conversions", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateConversion = (id: number, data: any) =>
  request(`/analitika/conversions/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteConversion = (id: number) =>
  request(`/analitika/conversions/${id}`, {
    method: "DELETE",
  });

export const conversionApi = {
  getConversions,
  createConversion,
  updateConversion,
  deleteConversion,
};

