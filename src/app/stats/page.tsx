"use client";

import React from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  BookOpen,
  Layers,
  Star,
  Flame,
  Calendar,
  Gift,
} from "lucide-react";

export default function StatisticsPage() {
  const { currentUser, userBooks, books } = useBookmarkd();

  const myUserBooks = userBooks.filter((ub) => ub.user_id === currentUser.id);
  const readUserBooks = myUserBooks.filter((ub) => ub.status === "read");

  const readBooksDetails = readUserBooks
    .map((ub) => ({
      userBook: ub,
      book: books.find((b) => b.id === ub.book_id),
    }))
    .filter((item) => item.book !== undefined);

  // Metrics
  const totalBooksRead = readBooksDetails.length;
  const totalPagesRead = readBooksDetails.reduce(
    (sum, item) => sum + (item.book?.page_count || 300),
    0
  );

  const ratingsGiven = readUserBooks
    .map((ub) => ub.rating)
    .filter((r): r is number => r !== undefined);
  const avgRating =
    ratingsGiven.length > 0
      ? (ratingsGiven.reduce((a, b) => a + b, 0) / ratingsGiven.length).toFixed(2)
      : "—";

  // Genres breakdown
  const genreCounts: Record<string, number> = {};
  readBooksDetails.forEach((item) => {
    item.book?.genres.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });

  const sortedGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Authors breakdown
  const authorCounts: Record<string, number> = {};
  readBooksDetails.forEach((item) => {
    if (item.book?.author) {
      authorCounts[item.book.author] = (authorCounts[item.book.author] || 0) + 1;
    }
  });

  const sortedAuthors = Object.entries(authorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Monthly activity
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

  // Format distribution
  const formatStats = [
    { format: "Physical Hardcover", pct: 45, count: "5 volumes", color: "bg-[#6E3511]" },
    { format: "Paperback Editions", pct: 35, count: "4 volumes", color: "bg-[#597928]" },
    { format: "Digital E-reader", pct: 15, count: "2 volumes", color: "bg-[#91AC67]" },
    { format: "Audiobook Narration", pct: 5, count: "1 volume", color: "bg-[#D8C9B9]" },
  ];

  // Activity Heatmap Simulation (16 weeks x 7 days)
  const heatmapWeeks = Array.from({ length: 16 }).map((_, w) =>
    Array.from({ length: 7 }).map((_, d) => {
      // simulate realistic reading density
      const seed = (w * 7 + d) % 9;
      if (seed === 0 || seed === 4) return 2; // high
      if (seed === 2 || seed === 6) return 1; // medium
      return 0; // none
    })
  );

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        kicker="Literary Analytics & Habits"
        title="Reading Statistics"
        description="In-depth breakdown of your reading velocity, pages turned, and format preferences."
        action={
          <Link href="/wrapped">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Gift className="w-4 h-4 text-[#FCECD8]" />}
            >
              View 2026 Wrapped
            </Button>
          </Link>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-1">
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

        <div className="p-5 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[#597928]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A6F65]">
              Pages Read
            </span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="font-serif text-3xl font-black text-[#2C221A]">
            {totalPagesRead.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#7A6F65]">Avg ~406 pages / book</p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-1">
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

        <div className="p-5 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-1">
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

      {/* Reading Activity Heatmap Grid */}
      <div className="p-6 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2E9DE] pb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <h3 className="font-serif text-base font-bold text-[#2C221A]">
              Daily Reading Activity Heatmap
            </h3>
          </div>
          <span className="text-xs text-[#7A6F65]">Last 16 Weeks</span>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1.5 min-w-[500px]">
            {heatmapWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5 flex-1">
                {week.map((val, dIdx) => (
                  <div
                    key={dIdx}
                    className={`w-4 h-4 rounded-xs transition-colors cursor-pointer ${
                      val === 2
                        ? "bg-[#597928]"
                        : val === 1
                        ? "bg-[#91AC67]"
                        : "bg-[#EFE8DF]"
                    }`}
                    title={
                      val === 2
                        ? "Finished book session"
                        : val === 1
                        ? "Read 30+ minutes"
                        : "No reading logged"
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#8C7D70] pt-1">
          <span>Less active</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#EFE8DF]" />
            <span className="w-3 h-3 rounded-xs bg-[#91AC67]" />
            <span className="w-3 h-3 rounded-xs bg-[#597928]" />
          </div>
          <span>More active</span>
        </div>
      </div>

      {/* Monthly Activity Velocity Chart */}
      <div className="p-6 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2E9DE] pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#6E3511]" />
            <h3 className="font-serif text-base font-bold text-[#2C221A]">
              Monthly Reading Velocity (2026)
            </h3>
          </div>
          <span className="text-xs text-[#7A6F65]">Volumes per Month</span>
        </div>

        <div className="pt-4 flex items-end justify-between gap-2 h-44 border-b border-[#E8DDCE] px-2">
          {monthlyData.map((item) => {
            const heightPct = (item.books / maxMonthBooks) * 100;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-bold text-[#597928] opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.books > 0 ? `${item.books} bks` : ""}
                </span>
                <div
                  className={`w-full max-w-[28px] rounded-t-lg transition-all duration-300 ${
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

      {/* 3 Column: Genres Distribution, Format Distribution & Favorite Authors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most-Read Genres */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#2C221A]">
            Most Explored Genres
          </h3>

          <div className="space-y-3">
            {sortedGenres.map(([genre, count]) => {
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
        <div className="p-6 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#2C221A]">
            Favorite Authors
          </h3>

          <div className="space-y-3">
            {sortedAuthors.length > 0 ? (
              sortedAuthors.map(([author, count]) => (
                <div key={author} className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF5EE] border border-[#EFE8DF]">
                  <span className="text-xs font-semibold text-[#3E342D] truncate pr-2">{author}</span>
                  <span className="text-xs font-bold text-[#597928] shrink-0">{count} {count === 1 ? 'book' : 'books'}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#8C7D70]">No author logs yet.</p>
            )}
          </div>
        </div>

        {/* Reading Format Distribution */}
        <div className="p-6 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs space-y-4">
          <h3 className="font-serif text-base font-bold text-[#2C221A]">
            Format Distribution
          </h3>

          <div className="space-y-3">
            {formatStats.map((item) => (
              <div key={item.format} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#3E342D]">{item.format}</span>
                  <span className="text-[#7A6F65]">{item.count} ({item.pct}%)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#EFE8DF] overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
