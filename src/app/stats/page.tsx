"use client";

import React from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import {
  BarChart2,
  BookOpen,
  Layers,
  Star,
  Flame,
  Calendar,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function StatisticsPage() {
  const { currentUser, userBooks, books, reviews } = useBookmarkd();

  // Filter books for this user
  const myUserBooks = userBooks.filter((ub) => ub.user_id === currentUser.id);
  const readUserBooks = myUserBooks.filter((ub) => ub.status === "read");

  const readBooksDetails = readUserBooks
    .map((ub) => ({
      userBook: ub,
      book: books.find((b) => b.id === ub.book_id),
    }))
    .filter((item) => item.book !== undefined);

  // 1. Total books read
  const totalBooksRead = readBooksDetails.length;

  // 2. Total pages read
  const totalPagesRead = readBooksDetails.reduce(
    (sum, item) => sum + (item.book?.page_count || 300),
    0
  );

  // 3. Average rating
  const ratingsGiven = readUserBooks
    .map((ub) => ub.rating)
    .filter((r): r is number => r !== undefined);
  const avgRating =
    ratingsGiven.length > 0
      ? (ratingsGiven.reduce((a, b) => a + b, 0) / ratingsGiven.length).toFixed(2)
      : "—";

  // 4. Most-read genres
  const genreCounts: Record<string, number> = {};
  readBooksDetails.forEach((item) => {
    item.book?.genres.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // 5. Favorite authors
  const authorCounts: Record<string, number> = {};
  readBooksDetails.forEach((item) => {
    if (item.book?.author) {
      authorCounts[item.book.author] = (authorCounts[item.book.author] || 0) + 1;
    }
  });

  const sortedAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // 6. Monthly Reading Activity (mock historical distribution across months)
  const monthlyData = [
    { month: "Jan", books: 2, pages: 975 },
    { month: "Feb", books: 1, pages: 245 },
    { month: "Mar", books: 0, pages: 0 },
    { month: "Apr", books: 0, pages: 0 },
    { month: "May", books: 0, pages: 0 },
    { month: "Jun", books: 0, pages: 0 },
    { month: "Jul", books: 0, pages: 0 },
    { month: "Aug", books: 0, pages: 0 },
    { month: "Sep", books: 0, pages: 0 },
    { month: "Oct", books: 0, pages: 0 },
    { month: "Nov", books: 0, pages: 0 },
    { month: "Dec", books: 0, pages: 0 },
  ];

  const maxMonthBooks = Math.max(...monthlyData.map((m) => m.books), 4);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Top Header */}
      <div className="border-b border-[#E8DDCE] pb-5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
          Literary Analytics
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A]">
          Reading Statistics
        </h1>
        <p className="text-xs text-[#7A6F65] mt-0.5">
          In-depth breakdown of your reading velocity, favorite genres, and lifelong pages turned.
        </p>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#6E3511]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F65]">
              Books Read
            </span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl font-black text-[#2C221A]">
            {totalBooksRead}
          </div>
          <p className="text-[11px] text-[#597928] font-medium">+100% vs last month</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#597928]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F65]">
              Pages Read
            </span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl font-black text-[#2C221A]">
            {totalPagesRead.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#7A6F65]">Avg ~406 pages/book</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F65]">
              Average Rating
            </span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="font-serif text-3xl font-black text-[#2C221A]">
            {avgRating}★
          </div>
          <p className="text-[11px] text-[#7A6F65]">Across logged reviews</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-orange-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F65]">
              Reading Streak
            </span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl font-black text-[#2C221A]">
            18 Days
          </div>
          <p className="text-[11px] text-[#597928] font-medium">Daily reader habit active</p>
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="p-6 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2E9DE] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#6E3511]" />
            <h3 className="font-serif text-base font-bold text-[#2C221A]">
              Monthly Reading Velocity (2026)
            </h3>
          </div>
          <span className="text-xs text-[#7A6F65]">Books per Month</span>
        </div>

        {/* SVG/HTML Bar Chart */}
        <div className="pt-4 flex items-end justify-between gap-2 h-44 border-b border-[#E8DDCE] px-2">
          {monthlyData.map((item) => {
            const heightPct = (item.books / maxMonthBooks) * 100;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-[#597928] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.books > 0 ? `${item.books} bks` : ""}
                </span>
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                    item.books > 0
                      ? "bg-[#597928] group-hover:bg-[#435E1C]"
                      : "bg-[#EFE8DF] h-1"
                  }`}
                  style={{ height: item.books > 0 ? `${heightPct}%` : "4px" }}
                />
                <span className="text-[10px] text-[#8C7D70] font-medium">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2 Column: Genres Distribution & Top Authors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most-Read Genres */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#2C221A]">
            Most Read Genres
          </h3>

          <div className="space-y-3">
            {sortedGenres.map(([genre, count], idx) => {
              const pct = Math.round((count / (totalBooksRead || 1)) * 100);
              return (
                <div key={genre} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#3E342D]">{genre}</span>
                    <span className="text-[#597928]">{count} books ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#EFE8DF] overflow-hidden">
                    <div
                      className="h-full bg-[#91AC67] rounded-full"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Favorite Authors */}
        <div className="p-6 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#2C221A]">
            Most Explored Authors
          </h3>

          <div className="space-y-3">
            {sortedAuthors.map(([author, count], idx) => (
              <div
                key={author}
                className="p-3 rounded-xl bg-[#FAF5ED] border border-[#EADECE] flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#6E3511] text-[#FCECD8] font-serif font-bold flex items-center justify-center text-xs">
                    {idx + 1}
                  </div>
                  <span className="font-semibold text-xs text-[#2C221A]">{author}</span>
                </div>
                <span className="text-xs font-medium text-[#7A6F65]">
                  {count} book{count > 1 ? "s" : ""} read
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
