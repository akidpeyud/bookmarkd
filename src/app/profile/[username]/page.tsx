"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { BookCard } from "@/components/BookCard";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { FollowersModal } from "@/components/FollowersModal";
import { Book } from "@/types";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Globe,
  Calendar,
  UserPlus,
  UserCheck,
  Edit3,
  Heart,
} from "lucide-react";

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const {
    currentUser,
    communityUsers,
    getUserProfile,
    isFollowing,
    followUser,
    unfollowUser,
    books,
    userBooks,
    reviews,
    lists,
  } = useBookmarkd();

  const [activeTab, setActiveTab] = useState<"logs" | "reviews" | "lists" | "library">("logs");
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"followers" | "following">("followers");

  const profile = getUserProfile(username) || currentUser;
  const isMe = currentUser.id === profile.id || currentUser.username === profile.username;
  const following = isFollowing(profile.id);

  // User's books
  const profileUserBooks = userBooks.filter((ub) => ub.user_id === profile.id);
  const readBooks = profileUserBooks
    .filter((ub) => ub.status === "read")
    .map((ub) => ({
      userBook: ub,
      book: books.find((b) => b.id === ub.book_id)!,
    }))
    .filter((item) => item.book !== undefined);

  // User's reviews
  const profileReviews = reviews.filter((r) => r.user_id === profile.id);

  // User's lists
  const profileLists = lists.filter((l) => l.user_id === profile.id && (!l.is_private || isMe));

  // Favorite 4 books (Letterboxd signature)
  const favoriteBooks = (profile.favorite_book_ids || [])
    .map((id) => books.find((b) => b.id === id))
    .filter((b): b is Book => Boolean(b));

  // Followers / Following mock calculation
  const followersList = communityUsers.filter((u) => u.id !== profile.id);
  const followingList = communityUsers.filter((u) => u.id !== profile.id).slice(0, 2);

  const openFollowers = () => {
    setModalType("followers");
    setFollowersModalOpen(true);
  };

  const openFollowing = () => {
    setModalType("following");
    setFollowersModalOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Profile Header Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#D8C9B9] shadow-sm"
            />
            <div className="space-y-1">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A]">
                {profile.full_name}
              </h1>
              <p className="text-xs text-[#7A6F65]">@{profile.username}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#8C7D70] pt-1">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[#6E3511] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div>
            {isMe ? (
              <Link href="/settings">
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Edit Profile
                </Button>
              </Link>
            ) : (
              <Button
                onClick={() => (following ? unfollowUser(profile.id) : followUser(profile.id))}
                variant={following ? "forest" : "primary"}
                size="sm"
                leftIcon={
                  following ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )
                }
              >
                {following ? "Following" : "Follow Reader"}
              </Button>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs sm:text-sm text-[#4A3E35] leading-relaxed max-w-2xl border-t border-[#F2E9DE] pt-4">
            {profile.bio}
          </p>
        )}

        {/* Profile Stats Quick Strip & Followers Trigger */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-[#F2E9DE] text-center">
          <div>
            <span className="block font-serif text-lg sm:text-xl font-bold text-[#2C221A]">
              {profileUserBooks.length}
            </span>
            <span className="text-[11px] text-[#7A6F65]">Volumes Tracked</span>
          </div>
          <div>
            <span className="block font-serif text-lg sm:text-xl font-bold text-[#2C221A]">
              {readBooks.length}
            </span>
            <span className="text-[11px] text-[#7A6F65]">Read</span>
          </div>
          <div>
            <span className="block font-serif text-lg sm:text-xl font-bold text-[#2C221A]">
              {profileReviews.length}
            </span>
            <span className="text-[11px] text-[#7A6F65]">Reviews</span>
          </div>
          <div
            onClick={openFollowers}
            className="cursor-pointer hover:bg-[#FAF5ED] p-1 rounded-xl transition-colors"
          >
            <span className="block font-serif text-lg sm:text-xl font-bold text-[#6E3511]">
              {followersList.length}
            </span>
            <span className="text-[11px] text-[#7A6F65] underline decoration-[#D8C9B9]">
              Followers
            </span>
          </div>
          <div
            onClick={openFollowing}
            className="cursor-pointer hover:bg-[#FAF5ED] p-1 rounded-xl transition-colors"
          >
            <span className="block font-serif text-lg sm:text-xl font-bold text-[#6E3511]">
              {followingList.length}
            </span>
            <span className="text-[11px] text-[#7A6F65] underline decoration-[#D8C9B9]">
              Following
            </span>
          </div>
        </div>
      </div>

      {/* Letterboxd Favorite Four Books Showcase */}
      {favoriteBooks.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#6E3511] fill-[#6E3511]" />
            <h2 className="font-serif text-base font-bold text-[#2C221A]">
              Favorite Four Books
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {favoriteBooks.map((book) => (
              <BookCard key={book.id} book={book} size="md" />
            ))}
          </div>
        </section>
      )}

      {/* Profile Tabs */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b border-[#E8DDCE] text-xs font-semibold">
          {[
            { id: "logs", label: `Reading Log (${readBooks.length})` },
            { id: "reviews", label: `Reviews (${profileReviews.length})` },
            { id: "lists", label: `Lists (${profileLists.length})` },
            { id: "library", label: `All Shelf (${profileUserBooks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "logs" | "reviews" | "lists" | "library")}
              className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
                activeTab === tab.id
                  ? "border-[#6E3511] text-[#6E3511] font-bold"
                  : "border-transparent text-[#7A6F65] hover:text-[#2C221A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Reading Log Timeline */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            {readBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {readBooks.map(({ book, userBook }) => (
                  <div key={book.id} className="space-y-1.5">
                    <BookCard book={book} size="md" />
                    {userBook.rating && (
                      <div className="flex items-center justify-between px-1 text-[11px]">
                        <StarRating rating={userBook.rating} size="sm" />
                        <span className="text-[#8C7D70]">
                          {userBook.finish_date || "2026"}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white border border-[#E7DCCE] text-xs text-[#7A6F65]">
                No completed books logged yet.
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === "reviews" && (
          <div className="space-y-4">
            {profileReviews.length > 0 ? (
              profileReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={{
                    ...review,
                    book: books.find((b) => b.id === review.book_id),
                  }}
                  showBookInfo={true}
                />
              ))
            ) : (
              <div className="p-8 text-center rounded-2xl bg-white border border-[#E7DCCE] text-xs text-[#7A6F65]">
                No reviews published yet.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Lists */}
        {activeTab === "lists" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profileLists.map((list) => (
              <Link
                key={list.id}
                href="/lists"
                className="p-4 rounded-2xl bg-white border border-[#E7DCCE] hover:border-[#6E3511] transition-all space-y-2 block"
              >
                <h4 className="font-serif text-sm font-bold text-[#2C221A]">
                  {list.title}
                </h4>
                <p className="text-xs text-[#7A6F65] line-clamp-2">
                  {list.description}
                </p>
                <span className="text-[11px] text-[#597928] font-semibold block">
                  {list.book_ids.length} books curated
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Tab 4: All Tracked Library */}
        {activeTab === "library" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profileUserBooks.map((ub) => {
              const b = books.find((x) => x.id === ub.book_id);
              if (!b) return null;
              return <BookCard key={b.id} book={b} size="md" />;
            })}
          </div>
        )}
      </div>

      {/* Followers & Following Modal */}
      <FollowersModal
        isOpen={followersModalOpen}
        onClose={() => setFollowersModalOpen(false)}
        title={modalType === "followers" ? `Followers of @${profile.username}` : `@${profile.username} is Following`}
        users={modalType === "followers" ? followersList : followingList}
      />
    </div>
  );
}
