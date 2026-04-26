import { request } from "./client";

export const getAll = () => request("/analitika/tracking-links");
export const listByCampaign = (id: number) => request(`/analitika/tracking-links?campaign_id=${id}`);
export const create = (data: any) =>
  request("/analitika/tracking-links", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const update = (id: number, data: any) =>
  request(`/analitika/tracking-links/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const remove = (id: number) =>
  request(`/analitika/tracking-links/${id}`, {
    method: "DELETE",
  });
export const publicTrackUrl = (id: number) => `https://analitika-production.up.railway.app/track/${id}`;

export const trackingLinksApi = {
  getAll,
  listByCampaign,
  create,
  update,
  remove,
  publicTrackUrl,
};
