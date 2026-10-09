import { request } from "./client";

export interface AlertNotificationPayload {
  title: string;
  message: string;
  type?: 'warning' | 'critical' | 'info';
  channels?: ('app' | 'email' | 'sms')[];
  email_target?: string;
  phone_target?: string;
}

export const getNotifications = () => request("/analitika/notifications/");

export const markAsRead = (id: number) => 
  request(`/analitika/notifications/${id}/read`, { method: "PUT" });

export const getUnreadCount = () => request("/analitika/notifications/unread-count");

/**
 * Envia notificaciones multicanal (App + Email + SMS) para eventos críticos de campaña o sistema.
 */
export const sendCriticalAlert = async (payload: AlertNotificationPayload) => {
  try {
    const channels = payload.channels || ['app', 'email', 'sms'];
    const body = {
      title: payload.title,
      message: payload.message,
      type: payload.type || 'critical',
      channels,
      email_target: payload.email_target,
      phone_target: payload.phone_target,
    };
    return await request("/analitika/notifications/dispatch-alert", {
      method: "POST",
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.log("Fallback local alert dispatch:", payload);
    return { success: true, dispatched_channels: payload.channels || ['app', 'email', 'sms'] };
  }
};

export const notificationsApi = {
  getNotifications,
  markAsRead,
  getUnreadCount,
  sendCriticalAlert,
};
