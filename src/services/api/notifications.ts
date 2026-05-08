import { request } from "./client";

export const getNotifications = () => request("/notifications");

export const markAsRead = (id: number) => 
  request(`/notifications/${id}/read`, { method: "PUT" });

export const notificationsApi = {
  getNotifications,
  markAsRead,
};
