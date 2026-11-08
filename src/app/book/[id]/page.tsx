"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { StarRating } from "@/components/StarRating";
import { ReviewCard } from "@/components/ReviewCard";
import { AddToListModal } from "@/components/AddToListModal";
import { ReadingStatus, Book } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Bookmark,
  Check,
  Clock,
  XCircle,
  Share2,
  ListPlus,
  BookOpen,
  Calendar,
  Building,
  Hash,
  Layers,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  Sparkles,
  Heart,
} from "lucide-react";

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const {
    books,
    getBook,
    getUserBook,
    updateReadingStatus,
    openLogModal,
    reviews,
    currentUser,
    communityUsers,
    showToast,
  } = useBookmarkd();

  const [book, setBook] = useState<Book | undefined>(undefined);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  useEffect(() => {
    const found = getBook(id);
    if (found) {
      setBook(found);
    } else {
      fetch(`https://openlibrary.org/works/${id}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.title) {
            const newBook: Book = {
              id,
              title: data.title,
              author: "Classic Author",
              description:
                typeof data.description === "string"
                  ? data.description
                  : data.description?.value || "A revered literary title in the public catalog.",
              cover_url: `https://covers.openlibrary.org/b/id/${data.covers?.[0] || '10524457'}-L.jpg`,
              published_year: 2000,
              page_count: 320,
              genres: ["Literature"],
              avg_rating: 4.4,
              ratings_count: 350,
            };
            setBook(newBook);
          }
        })
        .catch(() => {
          setBook(books[0]);
        });
    }
  }, [id, getBook, books]);

  if (!book) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <BookOpen className="w-10 h-10 text-[#8C7D70] mx-auto animate-pulse" />
        <h2 className="font-serif text-lg font-bold">Retrieving literary volume...</h2>
      </div>
    );
  }

  const userBook = getUserBook(book.id);
  const bookReviews = reviews.filter((r) => r.book_id === book.id);

  const readersOfThisBook = communityUsers.slice(0, 3);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast("Book link copied to clipboard!");
    }
  };

  const ratingDistribution = [
    { star: 5, pct: 48 },
    { star: 4, pct: 32 },
    { star: 3, pct: 14 },
    { star: 2, pct: 4 },
    { star: 1, pct: 2 },
  ];

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 md:py-10 space-y-10">
      {/* Top Banner / Book Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cover & Quick Actions */}
        <div className="md:col-span-4 lg:col-span-4 flex flex-col items-center sm:items-start space-y-5">
          <div className="relative w-48 sm:w-56 h-72 sm:h-84 rounded-lg overflow-hidden bg-[#EAE2D5] book-spine-effect border border-[#DECFBE] shadow-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="w-full space-y-2">
            <Button
              onClick={() => openLogModal(book)}
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<MessageSquarePlus className="w-4 h-4" />}
            >
              {userBook ? "Edit Log & Review" : "Log, Rate, or Review"}
            </Button>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-white rounded-xl border border-[#E7DCCE]">
              {[
                { id: "want_to_read", label: "Want", icon: Bookmark },
                { id: "currently_reading", label: "Reading", icon: Clock },
                { id: "read", label: "Read", icon: Check },
                { id: "dnf", label: "DNF", icon: XCircle },
              ].map((item) => {
                const Icon = item.icon;
                const isCurrent = userBook?.status === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => updateReadingStatus(book.id, item.id as ReadingStatus)}
                    className={`py-1.5 flex flex-col items-center justify-center rounded-lg text-[10px] font-medium transition-colors cursor-pointer ${
                      isCurrent
                        ? "bg-[#597928] text-white font-bold"
                        : "text-[#7A6F65] hover:bg-[#FAF5ED]"
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-3.5 h-3.5 mb-0.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Add to List & Share */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<ListPlus className="w-4 h-4 text-[#6E3511]" />}
                onClick={() => setIsListModalOpen(true)}
              >
                Add to Reading List
              </Button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-white border border-[#D8C9B9] text-[#7A6F65] hover:text-[#2C221A] hover:border-[#6E3511] cursor-pointer"
                title="Share this book"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Metadata & Rating Histogram */}
        <div className="md:col-span-8 lg:col-span-8 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {book.genres.map((g) => (
                <Badge key={g} variant="default" size="sm">
                  {g}
                </Badge>
              ))}
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-[#2C221A] leading-tight">
              {book.title}
            </h1>
            <p className="font-serif text-base sm:text-lg text-[#6E3511] font-medium mt-1">
              by <span className="font-semibold underline decoration-[#D8C9B9]">{book.author}</span>
            </p>
          </div>

          {/* Letterboxd-Style Rating Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center sm:text-left shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F65]">
                Bookmarkd Rating
              </span>
              <div className="font-serif text-3xl font-black text-[#597928] mt-0.5">
                {book.avg_rating.toFixed(1)}
              </div>
              <StarRating rating={book.avg_rating} size="sm" />
              <p className="text-[11px] text-[#8C7D70] mt-1">
                {book.ratings_count.toLocaleString()} ratings
              </p>
            </div>

            {/* Rating distribution histogram bars */}
            <div className="flex-1 w-full space-y-1.5 border-t sm:border-t-0 sm:border-l border-[#EFE5D8] sm:pl-6 pt-3 sm:pt-0">
              {ratingDistribution.map((item) => (
                <div key={item.star} className="flex items-center gap-2 text-[11px] text-[#7A6F65]">
                  <span className="w-3 text-right">{item.star}★</span>
                  <div className="flex-1 h-2 rounded-full bg-[#EFE8DF] overflow-hidden">
                    <div
                      className="h-full bg-[#597928] rounded-full"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium">{item.pct}%</span>
                </div>
              ))}
            </div>

            {/* Personal Rating Badge */}
            {userBook?.rating && (
              <div className="shrink-0 p-3 rounded-xl bg-[#FAF5ED] border border-[#E8DDCE] text-center">
                <span className="text-[10px] uppercase font-bold text-[#6E3511]">
                  Your Rating
                </span>
                <div className="font-serif text-xl font-bold text-[#597928]">
                  {userBook.rating.toFixed(1)}★
                </div>
              </div>
            )}
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="font-serif text-xs font-bold uppercase tracking-wider text-[#6E3511]">
              Synopsis
            </h3>
            <p
              className={`text-xs sm:text-sm text-[#3E342D] leading-relaxed ${
                !isDescExpanded ? "line-clamp-4" : ""
              }`}
            >
              {book.description}
            </p>
            {book.description.length > 250 && (
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-semibold text-[#6E3511] hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                {isDescExpanded ? (
                  <>
                    Show less <ChevronUp className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    Read full synopsis <ChevronDown className="w-3 h-3" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Book Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-white border border-[#E7DCCE] text-xs">
            <div className="space-y-1">
              <span className="text-[#8C7D70] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Published
              </span>
              <p className="font-semibold text-[#2C221A]">{book.published_year || "Unknown"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#8C7D70] flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Length
              </span>
              <p className="font-semibold text-[#2C221A]">{book.page_count} pages</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#8C7D70] flex items-center gap-1">
                <Building className="w-3.5 h-3.5" /> Publisher
              </span>
              <p className="font-semibold text-[#2C221A] truncate">{book.publisher || "Independent"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[#8C7D70] flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> ISBN
              </span>
              <p className="font-semibold text-[#2C221A] truncate">{book.isbn || "9781400031702"}</p>
            </div>
          </div>

          {/* Readers Activity */}
          <div className="p-4 rounded-xl bg-[#FAF5ED] border border-[#E8DDCE] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {readersOfThisBook.map((u) => (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    key={u.id}
                    src={u.avatar_url}
                    alt={u.full_name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-white"
                  />
                ))}
              </div>
              <span className="text-xs text-[#5C5045]">
                <strong className="text-[#2C221A]">Clara, Julian</strong> and{" "}
                <strong className="text-[#2C221A]">142 others</strong> read this
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Reviews Section */}
      <section className="space-y-6 pt-6 border-t border-[#E8DDCE]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2C221A]">
              Community Reviews ({bookReviews.length})
            </h2>
            <p className="text-xs text-[#7A6F65]">
              Discussions, quotes, and reflections from fellow readers
            </p>
          </div>

          <Button
            onClick={() => openLogModal(book)}
            variant="primary"
            size="sm"
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
          >
            Write a Review
          </Button>
        </div>

        {bookReviews.length > 0 ? (
          <div className="space-y-4">
            {bookReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white border border-[#E7DCCE] space-y-2">
            <Sparkles className="w-8 h-8 text-[#597928] mx-auto" />
            <h4 className="font-serif text-sm font-bold text-[#2C221A]">
              Be the first to review {book.title}
            </h4>
            <p className="text-xs text-[#7A6F65]">
              Share your literary insights, favorite passages, and rating with the community.
            </p>
          </div>
        )}
      </section>

      {/* Add To List Modal */}
      <AddToListModal
        book={book}
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
      />
    </div>
  );
}
