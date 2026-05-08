import { request } from "./client";

export const getNotifications = () => request("/analitika/notifications/");

export const markAsRead = (id: number) => 
  request(`/analitika/notifications/${id}/read`, { method: "PUT" });

export const getUnreadCount = () => request("/analitika/notifications/unread-count");

export const notificationsApi = {
  getNotifications,
  markAsRead,
  getUnreadCount,
};
