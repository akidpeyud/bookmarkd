"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import confetti from "canvas-confetti";
import {
  Sparkles,
  BookOpen,
  Trophy,
  Flame,
  Star,
  Layers,
  ArrowRight,
  ArrowLeft,
  Share2,
  Bookmark,
  Calendar,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function WrappedPage() {
  const { currentUser, userBooks, books, reviews, showToast } = useBookmarkd();

  const [currentSlide, setCurrentSlide] = useState(0);

  // Compute wrapped stats
  const myUserBooks = userBooks.filter((ub) => ub.user_id === currentUser.id);
  const readBooks = myUserBooks
    .filter((ub) => ub.status === "read")
    .map((ub) => ({
      userBook: ub,
      book: books.find((b) => b.id === ub.book_id)!,
    }))
    .filter((item) => item.book !== undefined);

  const totalBooks = readBooks.length;
  const totalPages = readBooks.reduce(
    (sum, item) => sum + (item.book.page_count || 300),
    0
  );

  // Highest rated book
  const highestRatedItem = [...readBooks].sort(
    (a, b) => (b.userBook.rating || 0) - (a.userBook.rating || 0)
  )[0];

  // Most read genre
  const genreCounts: Record<string, number> = {};
  readBooks.forEach((item) => {
    item.book.genres.forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });
  const topGenre =
    Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Literary Fiction";

  // Top Author
  const authorCounts: Record<string, number> = {};
  readBooks.forEach((item) => {
    authorCounts[item.book.author] = (authorCounts[item.book.author] || 0) + 1;
  });
  const topAuthor =
    Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Donna Tartt";

  // Thickest book vs Quickest book
  const sortedByPages = [...readBooks].sort(
    (a, b) => (b.book.page_count || 0) - (a.book.page_count || 0)
  );
  const thickestBook = sortedByPages[0];
  const quickestBook = sortedByPages[sortedByPages.length - 1];

  const triggerWrappedConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#6E3511", "#91AC67", "#597928", "#FCECD8"],
    });
  };

  const handleShareWrapped = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `📚 My Bookmarkd 2026 Wrapped:\n• ${totalBooks} books read (${totalPages.toLocaleString()} pages)\n• Top Genre: ${topGenre}\n• Crown Jewel: ${highestRatedItem?.book.title || "The Secret History"}\nCheck out Bookmarkd: ${window.location.origin}`
      );
      showToast("Wrapped summary copied to clipboard!");
    }
  };

  const slides = [
    // Slide 0: Intro Cover
    {
      kicker: "Bookmarkd Annual Retrospective",
      title: "Your 2026 Reading Wrapped",
      subtitle: `A celebration of pages turned, quiet evenings, and stories that reshaped your worldview.`,
      render: () => (
        <div className="space-y-6 text-center py-6">
          <div className="w-20 h-20 rounded-3xl bg-[#6E3511] text-[#FCECD8] flex items-center justify-center mx-auto shadow-xl border border-[#8C4B1E]">
            <Bookmark className="w-10 h-10 fill-[#FCECD8]" />
          </div>
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2C221A]">
              {currentUser.full_name}&apos;s Year in Books
            </h2>
            <p className="text-xs sm:text-sm text-[#7A6F65] max-w-md mx-auto mt-2">
              Ready to revisit your literary milestones, beloved authors, and reading velocity?
            </p>
          </div>
          <Button
            onClick={() => {
              triggerWrappedConfetti();
              setCurrentSlide(1);
            }}
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open My Wrapped Journey
          </Button>
        </div>
      ),
    },

    // Slide 1: Volume & Pages Turned
    {
      kicker: "Milestone Metric",
      title: "The Scale of Your Journey",
      subtitle: "Every chapter accumulated into a vast repository of memory.",
      render: () => (
        <div className="space-y-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#FAF5ED] border border-[#E8DDCE] text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
                Volumes Read
              </span>
              <div className="font-serif text-5xl font-black text-[#6E3511]">
                {totalBooks}
              </div>
              <p className="text-xs text-[#7A6F65]">books journeyed through</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#EFF4E7] border border-[#CDE0BE] text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
                Pages Turned
              </span>
              <div className="font-serif text-5xl font-black text-[#597928]">
                {totalPages.toLocaleString()}
              </div>
              <p className="text-xs text-[#7A6F65]">pages absorbed</p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-center text-[#5C5045] italic">
            &quot;A reader lives a thousand lives before he dies.&quot;
          </p>
        </div>
      ),
    },

    // Slide 2: Crown Jewel
    {
      kicker: "Highest Rated Masterpiece",
      title: "Your Crown Jewel of 2026",
      subtitle: "The book that earned your unconditional five-star devotion.",
      render: () =>
        highestRatedItem ? (
          <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-[#FAF5ED] border border-[#E8DDCE]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={highestRatedItem.book.cover_url}
              alt=""
              className="w-32 h-48 object-cover rounded-xl shadow-xl book-spine-effect shrink-0"
            />
            <div className="space-y-3 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#597928] text-white text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-white" /> Rated {highestRatedItem.userBook.rating || 5.0}★
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2C221A]">
                {highestRatedItem.book.title}
              </h3>
              <p className="text-xs font-semibold text-[#6E3511]">
                by {highestRatedItem.book.author}
              </p>
              {highestRatedItem.userBook.notes && (
                <p className="text-xs text-[#5C5045] italic bg-white p-3 rounded-xl border border-[#E8DDCE]">
                  &quot;{highestRatedItem.userBook.notes}&quot;
                </p>
              )}
            </div>
          </div>
        ) : null,
    },

    // Slide 3: Literary Atmosphere
    {
      kicker: "Atmospheric Aesthetic",
      title: "Your Literary Frequency",
      subtitle: "The world you returned to again and again.",
      render: () => (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-[#FAF5ED] to-white border border-[#E8DDCE] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#91AC67] text-white flex items-center justify-center mx-auto shadow-md">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#597928]">
              Dominant Genre
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#6E3511] mt-1">
              {topGenre}
            </h3>
            <p className="text-xs text-[#7A6F65] max-w-sm mx-auto mt-2">
              You gravitated towards intellect, melancholy, and evocative prose that kept you up until dawn.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 4: Author of the Year
    {
      kicker: "Beloved Voice",
      title: "Author of the Year",
      subtitle: "The pen you trusted most in 2026.",
      render: () => (
        <div className="p-8 rounded-3xl bg-[#FAF5ED] border border-[#E8DDCE] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#6E3511] text-[#FCECD8] flex items-center justify-center mx-auto shadow-md">
            <Heart className="w-8 h-8 fill-[#FCECD8]" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#597928]">
              Most Explored Author
            </span>
            <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#2C221A] mt-1">
              {topAuthor}
            </h3>
            <p className="text-xs text-[#7A6F65] mt-2">
              Whose characters felt like intimate confidants on cold rainy afternoons.
            </p>
          </div>
        </div>
      ),
    },

    // Slide 5: Thickest vs Quickest
    {
      kicker: "Dimensions of Thought",
      title: "Book Horizons",
      subtitle: "From epic tomes to miniature gems.",
      render: () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {thickestBook && (
            <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#6E3511]">
                Longest Expedition
              </span>
              <h4 className="font-serif text-sm font-bold text-[#2C221A] line-clamp-1">
                {thickestBook.book.title}
              </h4>
              <p className="font-serif text-2xl font-black text-[#597928]">
                {thickestBook.book.page_count} pages
              </p>
            </div>
          )}

          {quickestBook && (
            <div className="p-5 rounded-2xl bg-white border border-[#E7DCCE] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#597928]">
                Briefest Delight
              </span>
              <h4 className="font-serif text-sm font-bold text-[#2C221A] line-clamp-1">
                {quickestBook.book.title}
              </h4>
              <p className="font-serif text-2xl font-black text-[#6E3511]">
                {quickestBook.book.page_count} pages
              </p>
            </div>
          )}
        </div>
      ),
    },

    // Slide 6: Summary Share Card
    {
      kicker: "The Grand Finale",
      title: "Your 2026 Bookmarkd Card",
      subtitle: "Share your literary story with friends and fellow book lovers.",
      render: () => (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl bg-gradient-to-br from-[#6E3511] via-[#5A2B0E] to-[#431D08] text-[#FCECD8] shadow-2xl border border-[#8C4B1E] space-y-6">
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 fill-[#FCECD8]" />
                <span className="font-serif font-black tracking-wider text-sm">
                  BOOKMARKD &bull; 2026 WRAPPED
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#91AC67]">
                @{currentUser.username}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                <span className="block font-serif text-3xl font-extrabold text-white">
                  {totalBooks}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#FCECD8]/80">
                  Books Read
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
                <span className="block font-serif text-3xl font-extrabold text-[#91AC67]">
                  {totalPages.toLocaleString()}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-[#FCECD8]/80">
                  Pages Turned
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-white/10 py-1.5">
                <span className="text-[#FCECD8]/75">Top Genre:</span>
                <span className="font-bold text-white">{topGenre}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 py-1.5">
                <span className="text-[#FCECD8]/75">Favorite Author:</span>
                <span className="font-bold text-white">{topAuthor}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#FCECD8]/75">Crown Jewel:</span>
                <span className="font-bold text-[#91AC67]">
                  {highestRatedItem?.book.title || "The Secret History"} (5.0★)
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleShareWrapped}
              variant="forest"
              size="md"
              className="flex-1"
              leftIcon={<Share2 className="w-4 h-4" />}
            >
              Share Wrapped Story
            </Button>
            <Link href="/stats" className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                View Full Statistics
              </Button>
            </Link>
          </div>
        </div>
      ),
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 sm:py-12 space-y-6">
      {/* Slide Navigation Progress */}
      <div className="flex items-center gap-1.5">
        {slides.map((_, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
              idx === currentSlide
                ? "bg-[#6E3511]"
                : idx < currentSlide
                ? "bg-[#91AC67]"
                : "bg-[#E8DDCE]"
            }`}
          />
        ))}
      </div>

      {/* Main Slide Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white border border-[#E7DCCE] shadow-xl space-y-6 min-h-[480px] flex flex-col justify-between animate-fadeIn">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928] block">
            {slide.kicker}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#2C221A] mt-1">
            {slide.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A6F65] mt-1">
            {slide.subtitle}
          </p>
        </div>

        <div className="my-auto">{slide.render()}</div>

        {/* Slide Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#F2E9DE]">
          <Button
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <span className="text-xs text-[#8C7D70]">
            {currentSlide + 1} / {slides.length}
          </span>

          <Button
            onClick={() => {
              if (currentSlide < slides.length - 1) {
                setCurrentSlide(currentSlide + 1);
              } else {
                triggerWrappedConfetti();
              }
            }}
            variant="primary"
            size="sm"
            rightIcon={
              currentSlide < slides.length - 1 ? (
                <ArrowRight className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )
            }
          >
            {currentSlide < slides.length - 1 ? "Next Slide" : "Celebrate"}
          </Button>
        </div>
      </div>
    </div>
  );
}
