"use client";

import React, { useState, useEffect } from "react";
import { useBookmarkd } from "@/lib/store";
import { StarRating } from "./StarRating";
import { ReadingStatus } from "@/types";
import { X, AlertTriangle, Trash2, CheckCircle2 } from "lucide-react";

export function LogBookModal() {
  const {
    isLogModalOpen,
    logModalBook,
    closeLogModal,
    getUserBook,
    updateReadingStatus,
    removeUserBook,
    addReview,
    reviews,
    currentUser,
  } = useBookmarkd();

  const userBook = logModalBook ? getUserBook(logModalBook.id) : undefined;
  const existingReview = logModalBook
    ? reviews.find((r) => r.user_id === currentUser.id && r.book_id === logModalBook.id)
    : undefined;

  const [status, setStatus] = useState<ReadingStatus>("currently_reading");
  const [rating, setRating] = useState<number>(existingReview?.rating || userBook?.rating || 4.5);
  const [reviewContent, setReviewContent] = useState<string>(existingReview?.content || "");
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(existingReview?.contains_spoilers || false);
  const [pagesRead, setPagesRead] = useState<number>(userBook?.progress_pages || 0);
  const [startDate, setStartDate] = useState<string>(
    userBook?.start_date || new Date().toISOString().split("T")[0]
  );
  const [finishDate, setFinishDate] = useState<string>(
    userBook?.finish_date || new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>(userBook?.notes || "");

  useEffect(() => {
    if (logModalBook) {
      const timer = setTimeout(() => {
        const ub = getUserBook(logModalBook.id);
        const rev = reviews.find((r) => r.user_id === currentUser.id && r.book_id === logModalBook.id);

        if (ub) {
          setStatus(ub.status);
          setPagesRead(ub.progress_pages);
          if (ub.start_date) setStartDate(ub.start_date);
          if (ub.finish_date) setFinishDate(ub.finish_date);
          if (ub.notes) setNotes(ub.notes);
        } else {
          setStatus("read");
          setPagesRead(logModalBook.page_count || 0);
        }

        if (rev) {
          setRating(rev.rating);
          setReviewContent(rev.content);
          setContainsSpoilers(rev.contains_spoilers);
        } else if (ub?.rating) {
          setRating(ub.rating);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [logModalBook, getUserBook, reviews, currentUser.id]);

  if (!isLogModalOpen || !logModalBook) return null;

  const totalPages = logModalBook.page_count || 300;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update user book status and progress
    updateReadingStatus(logModalBook.id, status, {
      rating: rating > 0 ? rating : undefined,
      progress_pages: status === "read" ? totalPages : pagesRead,
      start_date: startDate || undefined,
      finish_date: status === "read" ? finishDate : undefined,
      notes: notes.trim() || undefined,
    });

    // 2. Add or update review if written
    if (reviewContent.trim().length > 0) {
      addReview(logModalBook.id, rating, reviewContent.trim(), containsSpoilers);
    }

    closeLogModal();
  };

  const handleRemove = () => {
    if (confirm("Remove this book from your library?")) {
      removeUserBook(logModalBook.id);
      closeLogModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAF5ED] rounded-xl shadow-2xl border border-[#E4D5C3] p-6 text-[#2C221A]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#E8DDCE] pb-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logModalBook.cover_url}
              alt={logModalBook.title}
              className="w-12 h-16 object-cover rounded shadow-xs"
            />
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#597928]">
                Reading Log
              </span>
              <h2 className="font-serif text-lg font-bold leading-tight line-clamp-1">
                {logModalBook.title}
              </h2>
              <p className="text-xs text-[#786C60]">{logModalBook.author}</p>
            </div>
          </div>
          <button
            onClick={closeLogModal}
            className="p-1.5 rounded-full hover:bg-[#EFE5D7] text-[#7A6F65] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-5 space-y-5">
          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-2">
              Reading Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: "want_to_read", label: "Want to Read" },
                { id: "currently_reading", label: "Reading" },
                { id: "read", label: "Read" },
                { id: "dnf", label: "DNF" },
              ].map((item) => {
                const isSelected = status === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => setStatus(item.id as ReadingStatus)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all text-center cursor-pointer ${
                      isSelected
                        ? "bg-[#6E3511] text-[#FCECD8] border-[#6E3511] shadow-xs"
                        : "bg-white text-[#4A3E35] border-[#DED0C0] hover:border-[#6E3511]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating */}
          <div className="bg-white p-3.5 rounded-lg border border-[#E6D9CA]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E3511]">
                Your Rating (Half-Stars Supported)
              </label>
              <span className="text-sm font-serif font-bold text-[#597928]">
                {rating > 0 ? `${rating.toFixed(1)} / 5.0` : "No rating"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <StarRating
                rating={rating}
                interactive={true}
                size="lg"
                onRatingChange={(newVal) => setRating(newVal)}
              />
              <button
                type="button"
                onClick={() => setRating(0)}
                className="text-[11px] text-[#8C7D70] hover:text-[#6E3511] underline cursor-pointer ml-auto"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Progress (if Currently Reading or DNF) */}
          {(status === "currently_reading" || status === "dnf") && (
            <div className="bg-white p-3.5 rounded-lg border border-[#E6D9CA] space-y-2">
              <div className="flex justify-between items-center text-xs font-medium">
                <span>Progress: {pagesRead} of {totalPages} pages</span>
                <span className="font-semibold text-[#597928]">
                  {Math.round((pagesRead / (totalPages || 1)) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={totalPages}
                value={pagesRead}
                onChange={(e) => setPagesRead(parseInt(e.target.value))}
                className="w-full accent-[#597928] cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max={totalPages}
                  value={pagesRead}
                  onChange={(e) => setPagesRead(Math.min(totalPages, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-20 px-2 py-1 text-xs border border-[#D5C6B5] rounded bg-[#FAF5ED]"
                />
                <span className="text-xs text-[#7A6F65]">pages read</span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#7A6F65] mb-1">
                Date Started
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D8C9B9] bg-white text-[#2C221A]"
              />
            </div>
            {status === "read" && (
              <div>
                <label className="block text-[11px] font-semibold text-[#7A6F65] mb-1">
                  Date Finished
                </label>
                <input
                  type="date"
                  value={finishDate}
                  onChange={(e) => setFinishDate(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D8C9B9] bg-white text-[#2C221A]"
                />
              </div>
            )}
          </div>

          {/* Written Review */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#6E3511]">
                Review / Journal Notes
              </label>
              <label className="flex items-center gap-1.5 text-xs text-[#7A6F65] cursor-pointer">
                <input
                  type="checkbox"
                  checked={containsSpoilers}
                  onChange={(e) => setContainsSpoilers(e.target.checked)}
                  className="accent-[#6E3511] rounded cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Contains spoilers
                </span>
              </label>
            </div>
            <textarea
              rows={4}
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              placeholder="What made this book resonate? Share your favorite quotes, themes, or critiques..."
              className="w-full p-3 text-xs leading-relaxed rounded-lg border border-[#D8C9B9] bg-white focus:outline-hidden focus:border-[#6E3511] focus:ring-1 focus:ring-[#6E3511] text-[#2C221A]"
            />
          </div>

          {/* Private Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-[#7A6F65] mb-1">
              Private Notes (Only visible to you)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Borrowed from city library, favorite edition"
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-[#D8C9B9] bg-white text-[#2C221A]"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E8DDCE]">
            {userBook ? (
              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove from Library
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeLogModal}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-[#D8C9B9] bg-white hover:bg-[#F2E8DC] text-[#4A3E35] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-lg bg-[#6E3511] hover:bg-[#5A2B0E] text-[#FCECD8] shadow-md transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Save Reading Log
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
