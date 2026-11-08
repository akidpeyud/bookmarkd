"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { ReviewCard } from "@/components/ReviewCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  Users,
  UserPlus,
  UserCheck,
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
  } = useBookmarkd();

  const [feedFilter, setFeedFilter] = useState<"all" | "following">("all");

  const otherUsers = communityUsers.filter((u) => u.id !== currentUser.id);

  const feedReviews = reviews.filter((r) => {
    if (feedFilter === "following") {
      return followingIds.includes(r.user_id) || r.user_id === currentUser.id;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        kicker="Literary Society & Social Circle"
        title="Community Reader Feed"
        description="Connect with passionate readers, view friends' real-time logs, and discover shared literary tastes."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Activity Feed (8 cols) */}
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
              All Reader Activity ({reviews.length})
            </button>
            <button
              onClick={() => setFeedFilter("following")}
              className={`pb-1 cursor-pointer transition-colors ${
                feedFilter === "following"
                  ? "border-b-2 border-[#6E3511] text-[#6E3511] font-bold"
                  : "text-[#7A6F65] hover:text-[#2C221A]"
              }`}
            >
              Following Only ({followingIds.length} readers)
            </button>
          </div>

          {/* Activity Feed Items */}
          <div className="space-y-4">
            {feedReviews.length > 0 ? (
              feedReviews.map((review) => {
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
              })
            ) : (
              <div className="p-12 text-center rounded-2xl bg-white border border-[#E7DCCE] space-y-2">
                <Users className="w-10 h-10 text-[#8C7D70] mx-auto" />
                <h4 className="font-serif text-base font-bold text-[#2C221A]">
                  No activities in this feed yet
                </h4>
                <p className="text-xs text-[#7A6F65]">
                  Follow more readers or write a book review to populate your feed!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Discover Readers to Follow (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-5 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#6E3511]" />
              <h3 className="font-serif text-sm font-bold text-[#2C221A]">
                Discover Readers
              </h3>
            </div>

            <div className="space-y-4">
              {otherUsers.map((user) => {
                const following = isFollowing(user.id);

                return (
                  <div
                    key={user.id}
                    className="p-3.5 rounded-2xl bg-[#FAF5ED] border border-[#E8DDCE] space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-2.5 group overflow-hidden"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-9 h-9 rounded-full object-cover border border-[#D5C6B5]"
                        />
                        <div className="truncate">
                          <span className="block font-semibold text-xs text-[#2C221A] group-hover:text-[#6E3511] truncate">
                            {user.full_name}
                          </span>
                          <span className="block text-[11px] text-[#8C7D70] truncate">
                            @{user.username}
                          </span>
                        </div>
                      </Link>

                      <Button
                        onClick={() =>
                          following ? unfollowUser(user.id) : followUser(user.id)
                        }
                        variant={following ? "forest" : "primary"}
                        size="xs"
                        leftIcon={
                          following ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )
                        }
                      >
                        {following ? "Following" : "Follow"}
                      </Button>
                    </div>

                    <p className="text-[11px] text-[#5C5045] leading-relaxed line-clamp-2">
                      {user.bio}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-[#8C7D70]">
                      <span>{user.location || "World"}</span>
                      <span className="font-medium text-[#597928]">
                        Goal: {user.reading_goal_annual} books/yr
                      </span>
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
