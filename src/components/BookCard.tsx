"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Book } from "@/types";
import { useBookmarkd } from "@/lib/store";
import { StarRating } from "./StarRating";
import { Bookmark, Check, Clock, BookOpen, XCircle, Plus } from "lucide-react";

interface BookCardProps {
  book: Book;
  size?: "sm" | "md" | "lg";
  showStatusBadge?: boolean;
}

export function BookCard({ book, size = "md", showStatusBadge = true }: BookCardProps) {
  const { getUserBook, openLogModal } = useBookmarkd();
  const [imageError, setImageError] = useState(false);

  const userBook = getUserBook(book.id);

  const heightClasses = {
    sm: "h-36 sm:h-44",
    md: "h-52 sm:h-64",
    lg: "h-64 sm:h-80",
  }[size];

  const statusIcons: Record<string, { label: string; icon: React.ReactNode; bg: string; text: string }> = {
    want_to_read: {
      label: "Want to Read",
      icon: <Bookmark className="w-3 h-3" />,
      bg: "bg-[#FCECD8]",
      text: "text-[#6E3511]",
    },
    currently_reading: {
      label: "Reading",
      icon: <Clock className="w-3 h-3" />,
      bg: "bg-[#EFF4E7]",
      text: "text-[#597928]",
    },
    read: {
      label: "Read",
      icon: <Check className="w-3 h-3" />,
      bg: "bg-[#597928]",
      text: "text-white",
    },
    dnf: {
      label: "DNF",
      icon: <XCircle className="w-3 h-3" />,
      bg: "bg-[#EFE8DF]",
      text: "text-[#7A6F65]",
    },
  };

  return (
    <div className="group relative flex flex-col">
      {/* Book Cover Container with Letterboxd-style framing */}
      <div className={`relative ${heightClasses} w-full rounded-md overflow-hidden bg-[#EAE2D5] book-spine-effect border border-[#E1D4C3] cursor-pointer`}>
        <Link href={`/book/${book.id}`} className="block w-full h-full">
          {!imageError && book.cover_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col justify-center items-center p-3 text-center bg-gradient-to-br from-[#6E3511] to-[#421F0A] text-[#FCECD8]">
              <BookOpen className="w-7 h-7 mb-2 opacity-80" />
              <span className="font-serif text-xs font-semibold line-clamp-3 leading-snug">
                {book.title}
              </span>
              <span className="text-[10px] mt-1 opacity-75">{book.author}</span>
            </div>
          )}
        </Link>

        {/* Quick Log overlay button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openLogModal(book);
          }}
          className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#6E3511]/90 hover:bg-[#6E3511] text-[#FCECD8] shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-20 cursor-pointer"
          title="Log or review this book"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Active status indicator badge */}
        {showStatusBadge && userBook && (
          <div
            className={`absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 shadow-sm ${statusIcons[userBook.status]?.bg} ${statusIcons[userBook.status]?.text}`}
          >
            {statusIcons[userBook.status]?.icon}
            <span>{statusIcons[userBook.status]?.label}</span>
          </div>
        )}
      </div>

      {/* Meta info */}
      <div className="mt-2 flex flex-col">
        <Link
          href={`/book/${book.id}`}
          className="font-serif text-sm font-semibold text-[#2C221A] hover:text-[#6E3511] line-clamp-1 leading-snug transition-colors"
          title={book.title}
        >
          {book.title}
        </Link>

        <p className="text-xs text-[#786C60] line-clamp-1 mt-0.5">
          {book.author}
        </p>

        <div className="mt-1 flex items-center justify-between text-xs">
          <StarRating rating={book.avg_rating} size="sm" showValue />
          {book.published_year && (
            <span className="text-[11px] text-[#9A8D80]">{book.published_year}</span>
          )}
        </div>
      </div>
    </div>
  );
}
