"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useBookmarkd } from "@/lib/store";
import { BookCard } from "@/components/BookCard";
import { searchBooksApi } from "@/lib/booksApi";
import { Book, ReadingStatus } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  Search,
  Sparkles,
  BookOpen,
  Loader2,
  SlidersHorizontal,
  X,
  Bookmark,
  Check,
  Clock,
  XCircle,
} from "lucide-react";

export default function DiscoverPage() {
  const { books, addOrGetBook, updateReadingStatus, getUserBook } = useBookmarkd();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [selectedEra, setSelectedEra] = useState<string>("All");

  const [apiResults, setApiResults] = useState<Book[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const [isPending, startTransition] = useTransition();

  const genres = [
    "All",
    "Dark Academia",
    "Classics",
    "Literary Fiction",
    "Contemporary",
    "Fantasy",
    "Sci-Fi",
    "Mystery",
    "Philosophy",
    "Japanese Literature",
  ];

  // Debounced API search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setApiResults([]);
      setIsSearchingApi(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingApi(true);
      try {
        const results = await searchBooksApi(searchQuery);
        startTransition(() => {
          setApiResults(results);
          results.forEach((b) => addOrGetBook(b));
        });
      } catch (err) {
        console.error("Search API error:", err);
      } finally {
        setIsSearchingApi(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, addOrGetBook]);

  // Combine unique books
  const allAvailableBooks = [...books];
  apiResults.forEach((ab) => {
    if (!allAvailableBooks.some((b) => b.id === ab.id || (b.isbn && b.isbn === ab.isbn))) {
      allAvailableBooks.unshift(ab);
    }
  });

  // Apply filters
  const filteredBooks = allAvailableBooks.filter((book) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        (book.isbn && book.isbn.includes(q)) ||
        book.genres.some((g) => g.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (selectedGenre !== "All") {
      const matchGenre = book.genres.some(
        (g) => g.toLowerCase() === selectedGenre.toLowerCase()
      );
      if (!matchGenre) return false;
    }

    if (minRating > 0 && book.avg_rating < minRating) {
      return false;
    }

    if (selectedEra !== "All" && book.published_year) {
      if (selectedEra === "2020s" && book.published_year < 2020) return false;
      if (selectedEra === "2000-2019" && (book.published_year < 2000 || book.published_year > 2019))
        return false;
      if (selectedEra === "Pre-2000" && book.published_year >= 2000) return false;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        kicker="Global Book Catalog & Archives"
        title="Discover Extraordinary Books"
        description="Search millions of volumes via live Google Books & Open Library archives, or browse curated collections."
      />

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8C7D70]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by title, author, genre, or ISBN (e.g. 'Donna Tartt', 'Dune', 'Philosophy')..."
          className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-[#D8C9B9] bg-white text-xs sm:text-sm focus:outline-hidden focus:border-[#6E3511] focus:ring-2 focus:ring-[#6E3511]/15 shadow-xs transition-all placeholder:text-[#9A8D80]"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7D70] hover:text-[#2C221A] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Genre Pills */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6E3511]">
          <Sparkles className="w-3.5 h-3.5 text-[#597928]" />
          <span>Curated Genres</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedGenre === genre
                  ? "bg-[#6E3511] text-[#FCECD8] shadow-xs"
                  : "bg-white text-[#4A3E35] border border-[#E0D3C3] hover:border-[#6E3511]"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-[#E7DCCE] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-[#7A6F65]">
            <SlidersHorizontal className="w-4 h-4 text-[#6E3511]" />
            <span className="font-semibold text-[#2C221A]">Filters:</span>
          </div>

          {/* Rating filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#7A6F65]">Min Rating:</span>
            <select
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
              className="px-2.5 py-1 rounded-md border border-[#D8C9B9] bg-[#FAF5ED] font-medium"
            >
              <option value="0">Any rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>

          {/* Era filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#7A6F65]">Era:</span>
            <select
              value={selectedEra}
              onChange={(e) => setSelectedEra(e.target.value)}
              className="px-2.5 py-1 rounded-md border border-[#D8C9B9] bg-[#FAF5ED] font-medium"
            >
              <option value="All">All Eras</option>
              <option value="2020s">2020 - Present</option>
              <option value="2000-2019">2000 - 2019</option>
              <option value="Pre-2000">Vintage & Classics (Pre-2000)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#8C7D70]">
          Showing <span className="font-bold text-[#2C221A]">{filteredBooks.length}</span> titles
        </div>
      </div>

      {/* Live Search Loading Indicator */}
      {isSearchingApi && (
        <div className="p-4 rounded-xl bg-[#EFF4E7] border border-[#CCDDC1] text-xs font-medium text-[#597928] flex items-center justify-center gap-2 animate-fadeIn">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Searching global book archives via Google Books API...</span>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredBooks.map((book) => {
            const userBook = getUserBook(book.id);

            return (
              <div key={book.id} className="flex flex-col justify-between group">
                <BookCard book={book} size="md" />

                {/* Quick Shelf Action Bar directly underneath card */}
                <div className="mt-2 pt-2 border-t border-[#F2E9DE] flex items-center justify-between text-[11px]">
                  <select
                    value={userBook?.status || ""}
                    onChange={(e) => {
                      if (e.target.value) {
                        updateReadingStatus(book.id, e.target.value as ReadingStatus);
                      }
                    }}
                    className="w-full text-[11px] py-1 px-1.5 rounded-md border border-[#D8C9B9] bg-[#FAF5ED] text-[#4A3E35] font-medium cursor-pointer hover:border-[#6E3511]"
                  >
                    <option value="" disabled>
                      + Add to Shelf
                    </option>
                    <option value="want_to_read">Want to Read</option>
                    <option value="currently_reading">Currently Reading</option>
                    <option value="read">Read</option>
                    <option value="dnf">DNF</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<BookOpen className="w-7 h-7 text-[#6E3511]" />}
          title="No books match your criteria"
          description="Try adjusting your keywords or reset filters to browse the complete Bookmarkd literary shelf."
          actionLabel="Reset All Filters"
          onAction={() => {
            setSearchQuery("");
            setSelectedGenre("All");
            setMinRating(0);
            setSelectedEra("All");
          }}
        />
      )}
    </div>
  );
}
