"use client";

import React, { useState } from "react";
import { useBookmarkd } from "@/lib/store";
import {
  Settings,
  User,
  Shield,
  Bell,
  Database,
  Save,
  Check,
  Heart,
} from "lucide-react";

export default function SettingsPage() {
  const {
    currentUser,
    updateProfile,
    books,
    isConfiguredWithSupabase,
    showToast,
  } = useBookmarkd();

  const [fullName, setFullName] = useState(currentUser.full_name);
  const [username, setUsername] = useState(currentUser.username);
  const [bio, setBio] = useState(currentUser.bio || "");
  const [location, setLocation] = useState(currentUser.location || "");
  const [website, setWebsite] = useState(currentUser.website || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url);
  const [favoriteBookIds, setFavoriteBookIds] = useState<string[]>(
    currentUser.favorite_book_ids || []
  );

  // Privacy & Notifications
  const [isPublic, setIsPublic] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName.trim(),
      username: username.trim(),
      bio: bio.trim(),
      location: location.trim(),
      website: website.trim(),
      avatar_url: avatarUrl.trim(),
      favorite_book_ids: favoriteBookIds,
    });
  };

  const toggleFavoriteBook = (bookId: string) => {
    if (favoriteBookIds.includes(bookId)) {
      setFavoriteBookIds(favoriteBookIds.filter((id) => id !== bookId));
    } else {
      if (favoriteBookIds.length >= 4) {
        showToast("You can choose up to 4 favorite books");
        return;
      }
      setFavoriteBookIds([...favoriteBookIds, bookId]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Top Header */}
      <div className="border-b border-[#E8DDCE] pb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
          Preferences & Account
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A]">
          Account Settings
        </h1>
        <p className="text-xs text-[#7A6F65] mt-0.5">
          Manage your reader profile, favorite books, privacy, and database connection.
        </p>
      </div>

      <div className="space-y-6">
        {/* Supabase Connection Status Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#6E3511]" />
              <h3 className="font-serif text-sm font-bold text-[#2C221A]">
                PostgreSQL & Supabase Architecture
              </h3>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                isConfiguredWithSupabase
                  ? "bg-[#EFF4E7] text-[#597928]"
                  : "bg-[#FCECD8] text-[#6E3511]"
              }`}
            >
              {isConfiguredWithSupabase ? "Supabase Connected" : "Local-First Persistent Store"}
            </span>
          </div>

          <p className="text-xs text-[#5C5045] leading-relaxed">
            {isConfiguredWithSupabase
              ? "Your application is actively communicating with your Supabase cloud PostgreSQL instance."
              : "Running in instant persistent demo mode with full offline state and Google Books integration. To connect your cloud PostgreSQL database, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file. The complete normalized schema is ready in supabase/schema.sql."}
          </p>
        </div>

        {/* Profile Information Form */}
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-5"
        >
          <div className="flex items-center gap-2 border-b border-[#F2E9DE] pb-3">
            <User className="w-4 h-4 text-[#6E3511]" />
            <h3 className="font-serif text-base font-bold text-[#2C221A]">
              Public Reader Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C9B9] bg-[#FAF5ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
                Username (@handle)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C9B9] bg-[#FAF5ED]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
              Bio / Literary Taste
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell other readers about your favorite prose, reading habits, and genres..."
              className="w-full p-3 text-xs rounded-lg border border-[#D8C9B9] bg-[#FAF5ED]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, Country"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C9B9] bg-[#FAF5ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
                Website / Journal
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C9B9] bg-[#FAF5ED]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
                Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C9B9] bg-[#FAF5ED]"
              />
            </div>
          </div>

          {/* Letterboxd Signature: Favorite Four Books Selector */}
          <div className="pt-3 border-t border-[#F2E9DE] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E3511] flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-[#6E3511]" />
                Letterboxd Favorite Four Books ({favoriteBookIds.length}/4)
              </label>
              <span className="text-[11px] text-[#7A6F65]">Click books to toggle favorites</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-2 bg-[#FAF5ED] rounded-xl border border-[#D8C9B9]">
              {books.map((b) => {
                const isSelected = favoriteBookIds.includes(b.id);
                return (
                  <div
                    key={b.id}
                    onClick={() => toggleFavoriteBook(b.id)}
                    className={`p-2 rounded-lg text-center cursor-pointer border transition-all ${
                      isSelected
                        ? "bg-[#6E3511] text-[#FCECD8] border-[#6E3511] shadow-xs"
                        : "bg-white text-[#2C221A] border-[#E8DDCE] hover:border-[#6E3511]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.cover_url}
                      alt={b.title}
                      className="w-12 h-16 object-cover mx-auto rounded shadow-2xs mb-1"
                    />
                    <span className="block text-[10px] font-bold line-clamp-1">{b.title}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6E3511] hover:bg-[#592B0E] text-[#FCECD8] text-xs font-bold shadow-md cursor-pointer transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>

        {/* Privacy & Notification Settings */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F2E9DE] pb-3">
            <Shield className="w-4 h-4 text-[#597928]" />
            <h3 className="font-serif text-base font-bold text-[#2C221A]">
              Privacy & Preferences
            </h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5ED] cursor-pointer">
              <div>
                <span className="block text-xs font-bold text-[#2C221A]">
                  Public Profile Visibility
                </span>
                <span className="block text-[11px] text-[#7A6F65]">
                  Allow other readers to view your reading journal and reviews.
                </span>
              </div>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 accent-[#597928] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5ED] cursor-pointer">
              <div>
                <span className="block text-xs font-bold text-[#2C221A]">
                  Share Reading Updates
                </span>
                <span className="block text-[11px] text-[#7A6F65]">
                  Broadcast when you finish books to your followers&apos; feeds.
                </span>
              </div>
              <input
                type="checkbox"
                checked={showActivity}
                onChange={(e) => setShowActivity(e.target.checked)}
                className="w-4 h-4 accent-[#597928] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF5ED] cursor-pointer">
              <div>
                <span className="block text-xs font-bold text-[#2C221A]">
                  Weekly Literary Digest
                </span>
                <span className="block text-[11px] text-[#7A6F65]">
                  Receive curated recommendations and friend activity summaries.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailDigest}
                onChange={(e) => setEmailDigest(e.target.checked)}
                className="w-4 h-4 accent-[#597928] cursor-pointer"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
