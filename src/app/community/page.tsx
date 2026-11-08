"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { ReviewCard } from "@/components/ReviewCard";
import {
  Users,
  UserPlus,
  UserCheck,
  Sparkles,
  BookOpen,
  Heart,
  MessageSquare,
  Bookmark,
} from "lucide-react";

export default function CommunityPage() {
  const {
    communityUsers,
    currentUser,
    followingIds,
    followUser,
    unfollowUser,
    isFollowing,
    reviews,
    books,
    userBooks,
  } = useBookmarkd();

  const [feedFilter, setFeedFilter] = useState<"all" | "following">("all");

  // Community readers excluding current user for discovery
  const otherUsers = communityUsers.filter((u) => u.id !== currentUser.id);

  // Filtered reviews for feed
  const feedReviews = reviews.filter((r) => {
    if (feedFilter === "following") {
      return followingIds.includes(r.user_id) || r.user_id === currentUser.id;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDCE] pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
            Literary Society
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A]">
            Reader Community
          </h1>
          <p className="text-xs text-[#7A6F65] mt-0.5">
            Connect with bibliophiles, see what friends are reading, and share recommendations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Community Activity Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Feed Filter Bar */}
          <div className="flex items-center gap-3 border-b border-[#E8DDCE] pb-3 text-xs font-semibold">
            <button
              onClick={() => setFeedFilter("all")}
              className={`pb-1 cursor-pointer transition-colors ${
                feedFilter === "all"
                  ? "border-b-2 border-[#6E3511] text-[#6E3511] font-bold"
                  : "text-[#7A6F65] hover:text-[#2C221A]"
              }`}
            >
              All Community Activity
            </button>
            <button
              onClick={() => setFeedFilter("following")}
              className={`pb-1 cursor-pointer transition-colors ${
                feedFilter === "following"
                  ? "border-b-2 border-[#6E3511] text-[#6E3511] font-bold"
                  : "text-[#7A6F65] hover:text-[#2C221A]"
              }`}
            >
              Following Only ({followingIds.length})
            </button>
          </div>

          {/* Activity Items List */}
          <div className="space-y-4">
            {feedReviews.map((review) => {
              const book = books.find((b) => b.id === review.book_id);
              return (
                <ReviewCard
                  key={review.id}
                  review={{
                    ...review,
                    book,
                  }}
                  showBookInfo={true}
                />
              );
            })}
          </div>
        </div>

        {/* Right Column: Discover Readers to Follow (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6E3511]" />
              <h3 className="font-serif text-sm font-bold text-[#2C221A]">
                Discover Readers
              </h3>
            </div>

            <div className="space-y-4">
              {otherUsers.map((user) => {
                const following = isFollowing(user.id);
                const userReadBooksCount = userBooks.filter(
                  (ub) => ub.user_id === user.id && ub.status === "read"
                ).length;

                return (
                  <div
                    key={user.id}
                    className="p-3 rounded-xl bg-[#FAF5ED] border border-[#E8DDCE] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-2.5 group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-9 h-9 rounded-full object-cover border border-[#D5C6B5]"
                        />
                        <div>
                          <span className="block font-semibold text-xs text-[#2C221A] group-hover:text-[#6E3511]">
                            {user.full_name}
                          </span>
                          <span className="block text-[11px] text-[#8C7D70]">
                            @{user.username}
                          </span>
                        </div>
                      </Link>

                      <button
                        onClick={() =>
                          following ? unfollowUser(user.id) : followUser(user.id)
                        }
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 ${
                          following
                            ? "bg-[#597928] text-white"
                            : "bg-[#6E3511] text-[#FCECD8] hover:bg-[#592B0E]"
                        }`}
                      >
                        {following ? (
                          <>
                            <UserCheck className="w-3 h-3" /> Following
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" /> Follow
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#5C5045] leading-relaxed line-clamp-2">
                      {user.bio}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-[#8C7D70]">
                      <span>{user.location || "World"}</span>
                      <span>Goal: {user.reading_goal_annual} books/yr</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
