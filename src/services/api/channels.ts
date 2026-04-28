import { request } from "./client";

export const getChannels = () =>
  request("/analitika/channels");

export const createChannel = (data: any) =>
  request("/analitika/channels", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateChannel = (id: number, data: any) =>
  request(`/analitika/channels/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteChannel = (id: number) =>
  request(`/analitika/channels/${id}`, {
    method: "DELETE",
  });

export const channelsApi = {
  getAll: getChannels,
  getChannels,
  createChannel,
  updateChannel,
  deleteChannel,
};

export const getAll = getChannels;

