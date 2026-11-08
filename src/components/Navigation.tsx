"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBookmarkd } from "@/lib/store";
import { MobileMenuDrawer } from "./layout/MobileMenuDrawer";
import {
  BookOpen,
  Compass,
  Library,
  ListOrdered,
  Users,
  Trophy,
  BarChart2,
  Bell,
  Settings,
  Plus,
  Bookmark,
  ChevronDown,
  UserCheck,
  Menu,
  Search,
  Gift,
  LogIn,
  LogOut,
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const {
    currentUser,
    communityUsers,
    switchUser,
    signOut,
    unreadNotifsCount,
    openLogModal,
  } = useBookmarkd();

  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/", icon: BookOpen },
    { label: "Discover", href: "/discover", icon: Compass },
    { label: "My Library", href: "/library", icon: Library },
    { label: "Reading Lists", href: "/lists", icon: ListOrdered },
    { label: "Community", href: "/community", icon: Users },
    { label: "Challenge", href: "/challenge", icon: Trophy },
    { label: "Statistics", href: "/stats", icon: BarChart2 },
    { label: "2026 Wrapped", href: "/wrapped", icon: Gift, badge: "New" },
  ];

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#FAF5ED] border-r border-[#E7DCCE] min-h-screen p-5 sticky top-0 h-screen overflow-y-auto">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 pb-6 border-b border-[#E8DDCE]">
          <div className="w-9 h-9 rounded-lg bg-[#6E3511] flex items-center justify-center text-[#FCECD8] shadow-sm">
            <Bookmark className="w-5 h-5 fill-[#FCECD8]" />
          </div>
          <div>
            <span className="font-serif text-xl font-black tracking-tight text-[#6E3511] block leading-none">
              BOOKMARKD
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#597928] font-bold">
              The Reader&apos;s Social
            </span>
          </div>
        </Link>

        {/* Quick Log Action CTA */}
        <button
          onClick={() => openLogModal()}
          className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#6E3511] hover:bg-[#592B0E] text-[#FCECD8] font-medium text-xs shadow-md transition-all cursor-pointer hover:shadow-lg active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>Log / Rate a Book</span>
        </button>

        {/* Nav Links */}
        <nav className="mt-6 flex-1 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#6E3511] text-[#FCECD8] shadow-xs"
                    : "text-[#4A3E35] hover:bg-[#F2E7D8] hover:text-[#2C221A]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? "text-[#FCECD8]" : "text-[#7A6F65]"}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-full bg-[#597928] text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="pt-4 border-t border-[#E8DDCE] my-3" />

          {/* Notifications */}
          <Link
            href="/notifications"
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/notifications"
                ? "bg-[#6E3511] text-[#FCECD8]"
                : "text-[#4A3E35] hover:bg-[#F2E7D8]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-[#7A6F65]" />
              <span>Notifications</span>
            </div>
            {unreadNotifsCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#597928] text-white">
                {unreadNotifsCount}
              </span>
            )}
          </Link>

          {/* Settings */}
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/settings"
                ? "bg-[#6E3511] text-[#FCECD8]"
                : "text-[#4A3E35] hover:bg-[#F2E7D8]"
            }`}
          >
            <Settings className="w-4 h-4 text-[#7A6F65]" />
            <span>Settings</span>
          </Link>

          {/* Sign In / Switch Account */}
          <Link
            href="/auth"
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              pathname === "/auth"
                ? "bg-[#6E3511] text-[#FCECD8]"
                : "text-[#4A3E35] hover:bg-[#F2E7D8]"
            }`}
          >
            <LogIn className="w-4 h-4 text-[#7A6F65]" />
            <span>Sign In / Switch</span>
          </Link>
        </nav>

        {/* Current User Pill & Switcher */}
        <div className="relative pt-4 border-t border-[#E8DDCE] mt-auto">
          <div
            onClick={() => setIsUserSwitcherOpen(!isUserSwitcherOpen)}
            className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E2D4C3] cursor-pointer hover:border-[#6E3511] transition-colors"
          >
            <Link
              href={`/profile/${currentUser.username}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#D5C6B5]"
              />
              <div className="truncate text-left">
                <span className="block font-semibold text-xs text-[#2C221A] truncate">
                  {currentUser.full_name}
                </span>
                <span className="block text-[10px] text-[#8C7D70] truncate">
                  @{currentUser.username}
                </span>
              </div>
            </Link>
            <button
              type="button"
              className="p-1 text-[#8C7D70] hover:text-[#2C221A] shrink-0"
              title="Switch demo reader or sign out"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* User Switcher Dropdown */}
          {isUserSwitcherOpen && (
            <div className="absolute bottom-16 left-0 right-0 p-2 bg-white rounded-xl shadow-xl border border-[#E2D4C3] z-50 space-y-1 animate-fadeIn">
              <span className="block px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#7A6F65]">
                Switch Reader Persona
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {communityUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setIsUserSwitcherOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                      currentUser.id === u.id
                        ? "bg-[#FAF5ED] font-bold text-[#6E3511]"
                        : "hover:bg-[#FAF5ED]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.avatar_url}
                        alt={u.full_name}
                        className="w-6 h-6 rounded-full object-cover shrink-0"
                      />
                      <span className="truncate">{u.full_name}</span>
                    </div>
                    {currentUser.id === u.id && (
                      <UserCheck className="w-3.5 h-3.5 text-[#597928] shrink-0 ml-1" />
                    )}
                  </button>
                ))}
              </div>

              {/* Login / Logout Options */}
              <div className="pt-2 border-t border-[#E8DDCE] space-y-1">
                <Link
                  href="/auth"
                  onClick={() => setIsUserSwitcherOpen(false)}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs font-semibold text-[#6E3511] hover:bg-[#FAF5ED] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login / Register New</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    setIsUserSwitcherOpen(false);
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="md:hidden sticky top-0 z-40 bg-[#FAF5ED]/95 backdrop-blur-xs border-b border-[#E8DDCE] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 -ml-1 text-[#4A3E35] hover:text-[#6E3511] cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-[#6E3511] flex items-center justify-center text-[#FCECD8]">
              <Bookmark className="w-4 h-4 fill-[#FCECD8]" />
            </div>
            <span className="font-serif font-black text-lg tracking-tight text-[#6E3511]">
              BOOKMARKD
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/discover"
            className="p-1.5 text-[#4A3E35] hover:text-[#6E3511]"
            title="Search books"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            href="/notifications"
            className="relative p-1.5 text-[#4A3E35] hover:text-[#6E3511]"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#597928]" />
            )}
          </Link>
          <Link href={`/profile/${currentUser.username}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentUser.avatar_url}
              alt={currentUser.full_name}
              className="w-7 h-7 rounded-full object-cover border border-[#D5C6B5]"
            />
          </Link>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAVIGATION ================= */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5ED]/95 backdrop-blur-md border-t border-[#E8DDCE] px-2 pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg"
      >
        <Link
          href="/"
          aria-label="Home Feed"
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
            pathname === "/" ? "text-[#6E3511] font-bold" : "text-[#7A6F65]"
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href="/discover"
          aria-label="Discover Books"
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
            pathname.startsWith("/discover") ? "text-[#6E3511] font-bold" : "text-[#7A6F65]"
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Discover</span>
        </Link>

        {/* Center Floating Log Action */}
        <button
          onClick={() => openLogModal()}
          aria-label="Quick log or rate book"
          className="w-12 h-12 -mt-5 rounded-full bg-[#6E3511] hover:bg-[#592B0E] text-[#FCECD8] shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center focus:outline-hidden focus:ring-2 focus:ring-[#597928]"
          title="Log a book"
        >
          <Plus className="w-6 h-6" />
        </button>

        <Link
          href="/library"
          aria-label="My Library"
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
            pathname.startsWith("/library") ? "text-[#6E3511] font-bold" : "text-[#7A6F65]"
          }`}
        >
          <Library className="w-5 h-5" />
          <span>Library</span>
        </Link>

        <Link
          href="/community"
          aria-label="Community"
          className={`min-w-[48px] min-h-[48px] flex flex-col items-center justify-center text-[10px] font-medium transition-colors ${
            pathname.startsWith("/community") ? "text-[#6E3511] font-bold" : "text-[#7A6F65]"
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Community</span>
        </Link>
      </nav>

      {/* Mobile Slide-over Drawer */}
      <MobileMenuDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
      />
    </>
  );
}
