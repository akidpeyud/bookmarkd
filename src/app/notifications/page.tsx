"use client";

import React from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  UserPlus,
  Trophy,
  CheckCircle,
} from "lucide-react";

export default function NotificationsPage() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUserProfile,
  } = useBookmarkd();

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "like_review":
        return <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />;
      case "comment_review":
        return <MessageSquare className="w-4 h-4 text-[#6E3511]" />;
      case "follow":
        return <UserPlus className="w-4 h-4 text-[#597928]" />;
      case "goal_reached":
        return <Trophy className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#7A6F65]" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
            Activity Alerts
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#2C221A]">
            Notifications
          </h1>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={markAllNotificationsAsRead}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#D8C9B9] text-xs font-semibold text-[#4A3E35] hover:border-[#6E3511] transition-colors cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#597928]" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notif) => {
            const actor = notif.actor || getUserProfile(notif.actor_id);

            return (
              <div
                key={notif.id}
                onClick={() => markNotificationAsRead(notif.id)}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                  notif.read
                    ? "bg-white border-[#E8DDCE] opacity-80"
                    : "bg-[#FFFDF9] border-[#D9C4AF] shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#FAF5ED] border border-[#E8DDCE] shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#2C221A]">
                      {actor && (
                        <Link
                          href={`/profile/${actor.username}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-bold text-[#6E3511] hover:underline mr-1"
                        >
                          {actor.full_name}
                        </Link>
                      )}
                      <span>{notif.message}</span>
                    </p>
                    <span className="text-[10px] text-[#9E9083] block">
                      {new Date(notif.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {!notif.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#597928] shrink-0 mt-2" />
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-[#E7DCCE] space-y-2">
            <CheckCircle className="w-10 h-10 text-[#597928] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#2C221A]">
              You are all caught up!
            </h3>
            <p className="text-xs text-[#7A6F65]">
              No new notifications right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
