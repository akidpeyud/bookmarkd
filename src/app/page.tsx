"use client";

import React from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { BookCard } from "@/components/BookCard";
import { ReviewCard } from "@/components/ReviewCard";
import {
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Plus,
  Compass,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const {
    books,
    userBooks,
    reviews,
    lists,
    currentUser,
    openLogModal,
  } = useBookmarkd();

  // Find currently reading books
  const currentlyReadingUserBooks = userBooks.filter(
    (ub) => ub.user_id === currentUser.id && ub.status === "currently_reading"
  );
  const currentlyReadingBooks = currentlyReadingUserBooks
    .map((ub) => ({
      book: books.find((b) => b.id === ub.book_id),
      userBook: ub,
    }))
    .filter((item) => item.book !== undefined);

  // Popular / Trending books
  const popularBooks = [...books].sort((a, b) => b.ratings_count - a.ratings_count).slice(0, 6);
  const trendingBooks = [...books].sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 5);

  // Recent community reviews
  const recentReviews = [...reviews].slice(0, 4);

  // Featured lists
  const featuredLists = [...lists].slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-10">
      {/* Editorial Welcome Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6E3511] via-[#5C2B0D] to-[#4A2007] text-[#FCECD8] p-6 sm:p-8 shadow-xl border border-[#8C4B1E]">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#597928] text-white text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Letterboxd for Book Lovers</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            Track books. Write reviews.<br />
            Curate your reading story.
          </h1>

          <p className="text-xs sm:text-sm text-[#FCECD8]/90 leading-relaxed max-w-xl">
            Welcome back, <span className="font-bold text-white">{currentUser.full_name}</span>.
            Record what you read, give half-star ratings, preserve beloved quotes, and discover timeless literature together.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => openLogModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#597928] hover:bg-[#48631F] text-white text-xs font-bold shadow-md transition-all cursor-pointer hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Log a Book</span>
            </button>

            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF5ED]/15 hover:bg-[#FAF5ED]/25 text-[#FCECD8] text-xs font-semibold backdrop-blur-xs transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Discover</span>
            </Link>
          </div>
        </div>

        {/* Decorative background book illustration */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none hidden sm:block">
          <BookOpen className="w-72 h-72 text-white" />
        </div>
      </section>

      {/* Currently Reading Shelf */}
      {currentlyReadingBooks.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#597928]" />
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C221A]">
                Currently Reading
              </h2>
            </div>
            <Link
              href="/library?status=currently_reading"
              className="text-xs font-semibold text-[#6E3511] hover:text-[#522509] flex items-center gap-1"
            >
              <span>View Shelf</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentlyReadingBooks.map(({ book, userBook }) => {
              if (!book) return null;
              const totalPages = book.page_count || 300;
              const percent = Math.min(100, Math.round((userBook.progress_pages / totalPages) * 100));

              return (
                <div
                  key={book.id}
                  className="p-4 rounded-xl bg-white border border-[#E7DCCE] shadow-xs flex gap-4 items-center hover:shadow-md transition-shadow"
                >
                  <Link href={`/book/${book.id}`} className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      className="w-16 h-24 object-cover rounded-md shadow-xs book-spine-effect"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div>
                      <Link
                        href={`/book/${book.id}`}
                        className="font-serif text-sm font-bold text-[#2C221A] hover:text-[#6E3511] line-clamp-1 block"
                      >
                        {book.title}
                      </Link>
                      <p className="text-xs text-[#7A6F65]">{book.author}</p>
                    </div>

                    {/* Reading progress */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-[#7A6F65]">
                        <span>
                          Page {userBook.progress_pages} of {totalPages}
                        </span>
                        <span className="font-bold text-[#597928]">{percent}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#EFE8DF] overflow-hidden">
                        <div
                          className="h-full bg-[#597928] rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => openLogModal(book)}
                      className="text-xs text-[#6E3511] hover:text-[#522509] font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>Update reading progress</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Popular Books on Bookmarkd */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#6E3511]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C221A]">
              Popular with Readers
            </h2>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold text-[#6E3511] hover:text-[#522509] flex items-center gap-1"
          >
            <span>All Books</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
          {popularBooks.map((book) => (
            <BookCard key={book.id} book={book} size="md" />
          ))}
        </div>
      </section>

      {/* Two Column Section: Recent Community Reviews & Featured Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Community Reviews */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-2">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C221A]">
              Recent Community Reviews
            </h2>
            <Link
              href="/community"
              className="text-xs font-semibold text-[#6E3511] hover:text-[#522509] flex items-center gap-1"
            >
              <span>Community Feed</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recentReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={{
                  ...review,
                  book: books.find((b) => b.id === review.book_id),
                }}
                showBookInfo={true}
              />
            ))}
          </div>
        </section>

        {/* Right 1 Col: Featured Reading Lists & Challenge Widget */}
        <section className="space-y-6">
          {/* Annual Challenge Widget */}
          <div className="p-5 rounded-xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#597928]">
                2026 Reading Goal
              </span>
              <Link href="/challenge" className="text-xs font-semibold text-[#6E3511] hover:underline">
                Details
              </Link>
            </div>

            {(() => {
              const readCount = userBooks.filter(
                (ub) => ub.user_id === currentUser.id && ub.status === "read"
              ).length;
              const goal = currentUser.reading_goal_annual || 25;
              const pct = Math.min(100, Math.round((readCount / goal) * 100));

              return (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-2xl font-bold text-[#2C221A]">
                      {readCount}{" "}
                      <span className="text-xs font-normal text-[#7A6F65]">
                        of {goal} books read
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[#597928]">{pct}%</span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-[#EFE8DF] overflow-hidden">
                    <div
                      className="h-full bg-[#597928] rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-[#7A6F65] leading-tight">
                    You are right on track for your reading journey this year!
                  </p>
                </div>
              );
            })()}
          </div>

          {/* Featured Lists Shelf */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-2">
              <h3 className="font-serif text-base font-bold text-[#2C221A]">
                Featured Lists
              </h3>
              <Link href="/lists" className="text-xs font-semibold text-[#6E3511]">
                All Lists
              </Link>
            </div>

            <div className="space-y-3">
              {featuredLists.map((list) => {
                const listBooks = list.book_ids
                  .map((id) => books.find((b) => b.id === id))
                  .filter(Boolean) as any[];

                return (
                  <Link
                    key={list.id}
                    href={`/lists#${list.id}`}
                    className="block p-4 rounded-xl bg-white border border-[#E7DCCE] hover:border-[#6E3511] transition-all group"
                  >
                    <h4 className="font-serif text-sm font-bold text-[#2C221A] group-hover:text-[#6E3511] line-clamp-1">
                      {list.title}
                    </h4>
                    <p className="text-xs text-[#7A6F65] line-clamp-2 mt-1">
                      {list.description}
                    </p>

                    {/* Book Cover Stacks */}
                    <div className="mt-3 flex items-center gap-1.5 overflow-hidden">
                      {listBooks.slice(0, 4).map((b, i) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={i}
                          src={b.cover_url}
                          alt={b.title}
                          className="w-8 h-12 object-cover rounded shadow-2xs border border-white"
                        />
                      ))}
                      <span className="text-[11px] text-[#9A8D80] ml-1.5 font-medium">
                        {list.book_ids.length} books
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Trending Collections Shelf */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-2">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#597928]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C221A]">
              Highest Rated Gems
            </h2>
          </div>
          <Link
            href="/discover"
            className="text-xs font-semibold text-[#6E3511] hover:text-[#522509] flex items-center gap-1"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {trendingBooks.map((book) => (
            <BookCard key={book.id} book={book} size="md" />
          ))}
        </div>
      </section>
    </div>
  );
}
