import { request } from "./client";
import { TrackingLink } from "./types";

export const getTrackingLinks = () => request<TrackingLink[]>("/analitika/tracking-links");
export const listByCampaign = (id: number) => request<TrackingLink[]>(`/analitika/tracking-links?campaign_id=${id}`);
export const createTrackingLink = (data: any) =>
  request<TrackingLink>("/analitika/tracking-links", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateTrackingLink = (id: number, data: any) =>
  request<TrackingLink>(`/analitika/tracking-links/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteTrackingLink = (id: number) =>
  request(`/analitika/tracking-links/${id}`, {
    method: "DELETE",
  });
export const publicTrackUrl = (id: number) => `https://analitika-production.up.railway.app/track/${id}`;

export const trackingLinksApi = {
  getTrackingLinks,
  listByCampaign,
  createTrackingLink,
  updateTrackingLink,
  deleteTrackingLink,
  publicTrackUrl,
};
