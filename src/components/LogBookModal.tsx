"use client";

import React, { useState, useEffect } from "react";
import { useBookmarkd } from "@/lib/store";
import { StarRating } from "./StarRating";
import { Book, ReadingStatus } from "@/types";
import {
  X,
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Search,
  BookPlus,
  ArrowLeft,
  Loader2,
  Sparkles,
} from "lucide-react";

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
    books,
    searchCatalog,
  } = useBookmarkd();

  const [selectedBook, setSelectedBook] = useState<Book | null>(logModalBook);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync selectedBook whenever modal opens or logModalBook changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedBook(logModalBook);
      setSearchQuery("");
      setSearchResults([]);
    }, 0);
    return () => clearTimeout(timer);
  }, [logModalBook, isLogModalOpen]);

  // Live search when user queries
  useEffect(() => {
    if (!searchQuery.trim()) {
      const timer = setTimeout(() => setSearchResults([]), 0);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchCatalog(searchQuery);
        setSearchResults(res);
      } catch (e) {
        console.warn("Search error in LogBookModal", e);
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, searchCatalog]);

  const userBook = selectedBook ? getUserBook(selectedBook.id) : undefined;
  const existingReview = selectedBook
    ? reviews.find((r) => r.user_id === currentUser.id && r.book_id === selectedBook.id)
    : undefined;

  const [status, setStatus] = useState<ReadingStatus>("currently_reading");
  const [rating, setRating] = useState<number>(existingReview?.rating || userBook?.rating || 4.5);
  const [reviewContent, setReviewContent] = useState<string>(existingReview?.content || "");
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(existingReview?.contains_spoilers || false);
  const [pagesRead, setPagesRead] = useState<number>(userBook?.progress_pages || 0);
  const [startDate, setStartDate] = useState<string>(userBook?.start_date || "");
  const [finishDate, setFinishDate] = useState<string>(userBook?.finish_date || "");
  const [notes, setNotes] = useState<string>(userBook?.notes || "");

  useEffect(() => {
    if (selectedBook) {
      const timer = setTimeout(() => {
        const ub = getUserBook(selectedBook.id);
        const rev = reviews.find((r) => r.user_id === currentUser.id && r.book_id === selectedBook.id);
        const todayStr = new Date().toISOString().split("T")[0];

        if (ub) {
          setStatus(ub.status);
          setPagesRead(ub.progress_pages);
          setStartDate(ub.start_date || todayStr);
          setFinishDate(ub.finish_date || todayStr);
          if (ub.notes) setNotes(ub.notes);
        } else {
          setStatus("read");
          setPagesRead(selectedBook.page_count || 0);
          setStartDate(todayStr);
          setFinishDate(todayStr);
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
  }, [selectedBook, getUserBook, reviews, currentUser.id]);

  if (!isLogModalOpen) return null;

  // VIEW 1: BOOK SELECTOR / SEARCH (When no book is selected yet)
  if (!selectedBook) {
    const displayedCatalog =
      searchQuery.trim().length > 0 ? searchResults : books.slice(0, 10);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
        <div
          className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#FAF5ED] rounded-2xl shadow-2xl border border-[#E4D5C3] p-6 text-[#2C221A] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-[#E8DDCE] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#6E3511] flex items-center justify-center text-[#FCECD8] shadow-xs">
                <BookPlus className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#597928]">
                  Reading Tracker
                </span>
                <h2 className="font-serif text-lg font-bold leading-tight text-[#2C221A]">
                  Log a Book
                </h2>
                <p className="text-xs text-[#786C60]">
                  Select or search for the volume you want to log or review
                </p>
              </div>
            </div>
            <button
              onClick={closeLogModal}
              className="p-1.5 rounded-full hover:bg-[#EFE5D7] text-[#7A6F65] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input Box */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#8C7D70]">
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#6E3511]" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by book title, author, or ISBN..."
              autoFocus
              className="w-full pl-9 pr-8 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D5C6B5] bg-white text-[#2C221A] focus:outline-hidden focus:border-[#6E3511] focus:ring-2 focus:ring-[#6E3511]/15 placeholder:text-[#9A8D80]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-2.5 flex items-center text-[#8C7D70] hover:text-[#2C221A] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Catalog / Search Results List */}
          <div className="mt-4 flex-1 space-y-2 max-h-80 overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#8C7D70] uppercase tracking-wider pb-1">
              <span>
                {searchQuery ? `Search Results (${displayedCatalog.length})` : "Popular Literary Volumes"}
              </span>
              {!searchQuery && (
                <span className="flex items-center gap-1 text-[#597928] normal-case font-medium">
                  <Sparkles className="w-3 h-3" /> Catalog suggestions
                </span>
              )}
            </div>

            {displayedCatalog.length > 0 ? (
              displayedCatalog.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBook(b)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#EADECE] hover:border-[#6E3511] hover:bg-[#FDFBF7] cursor-pointer transition-all group shadow-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.cover_url}
                      alt={b.title}
                      className="w-10 h-14 object-cover rounded shadow-xs shrink-0"
                    />
                    <div className="overflow-hidden">
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#2C221A] group-hover:text-[#6E3511] truncate">
                        {b.title}
                      </h4>
                      <p className="text-xs text-[#786C60] truncate">{b.author}</p>
                      <div className="flex items-center gap-2 text-[10px] text-[#8C7D70] mt-0.5">
                        <span>{b.published_year}</span>
                        <span>&bull;</span>
                        <span>{b.page_count} pages</span>
                      </div>
                    </div>
                  </div>

                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#FAF5ED] text-[#6E3511] border border-[#E4D5C3] group-hover:bg-[#6E3511] group-hover:text-[#FCECD8] transition-colors ml-2">
                    Select & Log
                  </span>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-[#7A6F65] space-y-2">
                <Search className="w-8 h-8 mx-auto text-[#B3A495]" />
                <p>No books found matching &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-[11px] text-[#8C7D70]">
                  Try searching for classic titles like <em>The Secret History</em>, <em>Babel</em>, or <em>Piranesi</em>.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#E8DDCE] flex justify-end">
            <button
              type="button"
              onClick={closeLogModal}
              className="px-4 py-2 text-xs font-medium rounded-lg border border-[#D8C9B9] bg-white hover:bg-[#F2E8DC] text-[#4A3E35] transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VIEW 2: LOGGING & REVIEW FORM (When selectedBook is defined)
  const totalPages = selectedBook.page_count || 300;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update user book status and progress
    updateReadingStatus(selectedBook.id, status, {
      rating: rating > 0 ? rating : undefined,
      progress_pages: status === "read" ? totalPages : pagesRead,
      start_date: startDate || undefined,
      finish_date: status === "read" ? finishDate : undefined,
      notes: notes.trim() || undefined,
    });

    // 2. Add or update review if written
    if (reviewContent.trim().length > 0) {
      addReview(selectedBook.id, rating, reviewContent.trim(), containsSpoilers);
    }

    closeLogModal();
  };

  const handleRemove = () => {
    if (confirm("Remove this book from your library?")) {
      removeUserBook(selectedBook.id);
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
              src={selectedBook.cover_url}
              alt={selectedBook.title}
              className="w-12 h-16 object-cover rounded shadow-xs shrink-0"
            />
            <div className="overflow-hidden">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#597928]">
                Reading Log
              </span>
              <h2 className="font-serif text-lg font-bold leading-tight line-clamp-1">
                {selectedBook.title}
              </h2>
              <p className="text-xs text-[#786C60] line-clamp-1">{selectedBook.author}</p>
              <button
                type="button"
                onClick={() => setSelectedBook(null)}
                className="inline-flex items-center gap-1 text-[11px] text-[#6E3511] hover:underline font-semibold mt-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" /> Change Book
              </button>
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
