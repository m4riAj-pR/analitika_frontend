import { request } from "./client";
import { TrackingLink } from "./types";
import { API_BASE_URL } from "./config";

const BASE = "/analitika/tracking-links";

export const getTrackingLinks = () => request<TrackingLink[]>(BASE);

export const listByCampaign = (id: number) =>
  request<TrackingLink[]>(`${BASE}?campaign_id=${id}`);

export const createTrackingLink = (data: any) =>
  request<TrackingLink>(BASE, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateTrackingLink = (id: number | string, data: any) =>
  request<TrackingLink>(`${BASE}/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteTrackingLink = (id: number | string) =>
  request(`${BASE}/${id}`, {
    method: "DELETE",
  });

export const publicTrackUrl = (id: number) =>
  `${API_BASE_URL}/c/${id}`;

export const trackingLinksApi = {
  getAll: getTrackingLinks,
  getTrackingLinks,
  listByCampaign,
  create: createTrackingLink,
  update: updateTrackingLink,
  remove: deleteTrackingLink,
  deleteTrackingLink,
  publicTrackUrl,
};

export const getAll = getTrackingLinks;
