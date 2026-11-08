import { NotificationItem } from "@/types";
import { INITIAL_NOTIFICATIONS } from "../mockData";
import { supabase, isSupabaseConfigured } from "../supabase";

const STORAGE_KEY = "bookmarkd_notifications";

export const notificationsService = {
  getNotifications(userId?: string): NotificationItem[] {
    if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let list: NotificationItem[] = stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
      if (userId) {
        list = list.filter((n) => n.user_id === userId || !n.user_id);
      }
      return list;
    } catch (e) {
      console.warn("Storage read error for notifications:", e);
      return INITIAL_NOTIFICATIONS;
    }
  },

  getAllNotifications(): NotificationItem[] {
    if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : INITIAL_NOTIFICATIONS;
    } catch (e) {
      console.warn("Storage read error for all notifications:", e);
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifications: NotificationItem[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.warn("Storage write error for notifications:", e);
    }
  },

  async syncNotificationToCloud(notification: NotificationItem): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("notifications").insert({
          id: notification.id,
          user_id: notification.user_id,
          actor_id: notification.actor_id,
          type: notification.type,
          entity_id: notification.entity_id,
          message: notification.message,
          read: notification.read,
          created_at: notification.created_at,
        });
      } catch (err) {
        console.warn("Notification cloud sync skipped:", err);
      }
    }
  },

  async markAsReadInCloud(notificationId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notificationId);
      } catch (err) {
        console.warn("Notification mark read cloud sync skipped:", err);
      }
    }
  },
};
