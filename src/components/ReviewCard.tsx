"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Review } from "@/types";
import { useBookmarkd } from "@/lib/store";
import { StarRating } from "./StarRating";
import { Heart, MessageSquare, AlertTriangle, Eye, EyeOff, Send, Trash2 } from "lucide-react";

interface ReviewCardProps {
  review: Review;
  showBookInfo?: boolean;
}

export function ReviewCard({ review, showBookInfo = false }: ReviewCardProps) {
  const {
    currentUser,
    getUserProfile,
    likeReview,
    comments,
    addReviewComment,
    deleteReview,
  } = useBookmarkd();

  const author = review.user || getUserProfile(review.user_id) || currentUser;
  const isAuthor = currentUser.id === review.user_id;

  const [revealedSpoiler, setRevealedSpoiler] = useState(!review.contains_spoilers);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const reviewComments = comments[review.id] || [];

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addReviewComment(review.id, commentText.trim());
    setCommentText("");
  };

  const formattedDate = new Date(review.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="p-4 sm:p-5 rounded-xl bg-white border border-[#E8DDCE] shadow-xs transition-shadow hover:shadow-md">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.username}`} className="group flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={author.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
              alt={author.full_name}
              className="w-9 h-9 rounded-full object-cover border border-[#DFD3C4] group-hover:ring-2 group-hover:ring-[#6E3511] transition-all"
            />
            <div>
              <div className="font-semibold text-xs text-[#2C221A] group-hover:text-[#6E3511]">
                {author.full_name}
              </div>
              <div className="text-[11px] text-[#8C7D70]">
                @{author.username}
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 text-right">
          <StarRating rating={review.rating} size="sm" />
          <span className="text-[11px] text-[#A09386]">{formattedDate}</span>
          {isAuthor && (
            <button
              onClick={() => {
                if (confirm("Delete this review?")) deleteReview(review.id);
              }}
              className="text-[#B3A495] hover:text-rose-700 p-1 cursor-pointer"
              title="Delete review"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Optional Book Banner */}
      {showBookInfo && review.book && (
        <div className="mt-3 p-2.5 rounded-lg bg-[#FAF5ED] border border-[#EADECE] flex items-center gap-3">
          <Link href={`/book/${review.book.id}`} className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={review.book.cover_url}
              alt={review.book.title}
              className="w-10 h-14 object-cover rounded shadow-xs"
            />
          </Link>
          <div className="overflow-hidden">
            <Link
              href={`/book/${review.book.id}`}
              className="font-serif text-xs font-bold text-[#2C221A] hover:text-[#6E3511] line-clamp-1"
            >
              {review.book.title}
            </Link>
            <p className="text-[11px] text-[#7A6F65]">{review.book.author}</p>
          </div>
        </div>
      )}

      {/* Review Content (with Spoiler Shield) */}
      <div className="mt-3.5">
        {review.contains_spoilers && !revealedSpoiler ? (
          <div className="p-3.5 rounded-lg bg-[#FAF4EA] border border-dashed border-[#DECFBE] text-center flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
              <AlertTriangle className="w-4 h-4" />
              <span>This review contains plot spoilers</span>
            </div>
            <button
              onClick={() => setRevealedSpoiler(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-[#6E3511] text-[#FCECD8] hover:bg-[#592B0E] transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              Reveal review
            </button>
          </div>
        ) : (
          <div className="relative">
            <p className="text-xs sm:text-sm text-[#3E342D] leading-relaxed whitespace-pre-line font-normal">
              {review.content}
            </p>
            {review.contains_spoilers && (
              <button
                onClick={() => setRevealedSpoiler(false)}
                className="mt-2 text-[10px] text-[#8C7D70] hover:text-[#6E3511] inline-flex items-center gap-1 cursor-pointer"
              >
                <EyeOff className="w-3 h-3" /> Hide spoilers
              </button>
            )}
          </div>
        )}
      </div>

      {/* Actions footer */}
      <div className="mt-4 pt-3 border-t border-[#F2E9DE] flex items-center justify-between text-xs text-[#7A6F65]">
        <div className="flex items-center gap-4">
          <button
            onClick={() => likeReview(review.id)}
            aria-label={review.liked_by_me ? "Unlike review" : "Like review"}
            className={`inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-[#FAF5ED] ${
              review.liked_by_me ? "text-[#597928]" : "hover:text-[#6E3511]"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${review.liked_by_me ? "fill-[#597928] text-[#597928]" : ""}`}
            />
            <span>{review.likes_count}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            aria-label={`Toggle comments, ${reviewComments.length || review.comments_count || 0} comments`}
            className="inline-flex items-center gap-1.5 font-medium hover:text-[#6E3511] transition-colors cursor-pointer py-1 px-1.5 rounded-md hover:bg-[#FAF5ED]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{reviewComments.length || review.comments_count || 0}</span>
          </button>
        </div>

        <span className="text-[11px] text-[#A79A8D]">Bookmarkd Review</span>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-[#EFE5D8] space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6E3511]">
            Comments ({reviewComments.length})
          </h4>

          {reviewComments.length === 0 ? (
            <p className="text-xs text-[#9B8E81] italic">No comments yet. Start the conversation!</p>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {reviewComments.map((comment) => {
                const commentUser = comment.user || getUserProfile(comment.user_id) || currentUser;
                return (
                  <div key={comment.id} className="p-2.5 rounded-lg bg-[#FAF5ED] text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[#2C221A]">
                        {commentUser.full_name}
                      </span>
                      <span className="text-[10px] text-[#9E9083]">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[#4E433A]">{comment.content}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* New Comment Input */}
          <form onSubmit={handlePostComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a thoughtful reply..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-[#D8C9B9] bg-white focus:outline-hidden focus:border-[#6E3511]"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-3 py-1.5 rounded-lg bg-[#6E3511] hover:bg-[#592B0E] disabled:opacity-40 text-[#FCECD8] text-xs font-medium cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
