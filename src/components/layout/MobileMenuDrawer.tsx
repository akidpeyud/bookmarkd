"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBookmarkd } from "@/lib/store";
import {
  X,
  Trophy,
  BarChart2,
  Bell,
  Settings,
  Bookmark,
  UserCheck,
  Compass,
  Library,
  ListOrdered,
  Users,
  BookOpen,
  Gift,
} from "lucide-react";

export interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const pathname = usePathname();
  const {
    currentUser,
    communityUsers,
    switchUser,
    unreadNotifsCount,
  } = useBookmarkd();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const links = [
    { label: "Home Feed", href: "/", icon: BookOpen },
    { label: "Discover Books", href: "/discover", icon: Compass },
    { label: "My Library Shelf", href: "/library", icon: Library },
    { label: "Reading Lists", href: "/lists", icon: ListOrdered },
    { label: "Community & Friends", href: "/community", icon: Users },
    { label: "2026 Reading Challenge", href: "/challenge", icon: Trophy },
    { label: "Reading Statistics", href: "/stats", icon: BarChart2 },
    { label: "2026 Reading Wrapped", href: "/wrapped", icon: Gift, badge: "New" },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount : undefined,
    },
    { label: "Settings & Privacy", href: "/settings", icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-4/5 max-w-xs bg-[#FAF5ED] h-full shadow-2xl border-l border-[#E8DDCE] flex flex-col z-10 p-5 overflow-y-auto animate-fadeIn">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#6E3511] flex items-center justify-center text-[#FCECD8]">
              <Bookmark className="w-4 h-4 fill-[#FCECD8]" />
            </div>
            <div>
              <span className="font-serif text-base font-black text-[#6E3511] block leading-none">
                BOOKMARKD
              </span>
              <span className="text-[9px] uppercase tracking-wider text-[#597928] font-bold">
                Navigation
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-[#7A6F65] hover:bg-[#EFE5D8] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Profile Strip */}
        <div className="py-4 border-b border-[#E8DDCE]">
          <Link
            href={`/profile/${currentUser.username}`}
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-xl bg-white border border-[#E7DCCE] hover:border-[#6E3511] transition-colors"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-10 h-10 rounded-full object-cover border border-[#D8C9B9]"
            />
            <div className="truncate">
              <span className="font-semibold text-xs text-[#2C221A] block truncate">
                {currentUser.full_name}
              </span>
              <span className="text-[10px] text-[#8C7D70] block truncate">
                @{currentUser.username}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="py-4 space-y-1 flex-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#6E3511] text-[#FCECD8]"
                    : "text-[#4A3E35] hover:bg-[#F2E7D8]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-[#FCECD8]" : "text-[#7A6F65]"}`}
                  />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-[#597928] text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Switch Reader Persona */}
        <div className="pt-4 border-t border-[#E8DDCE] space-y-2">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-[#7A6F65]">
            Switch Demo Reader
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {communityUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => {
                  switchUser(u.id);
                  onClose();
                }}
                className={`p-1.5 rounded-lg text-left text-[11px] font-medium border flex items-center justify-between ${
                  currentUser.id === u.id
                    ? "bg-[#6E3511] text-[#FCECD8] border-[#6E3511]"
                    : "bg-white text-[#4A3E35] border-[#E8DDCE]"
                }`}
              >
                <span className="truncate">{u.full_name.split(" ")[0]}</span>
                {currentUser.id === u.id && <UserCheck className="w-3 h-3 text-[#91AC67]" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
