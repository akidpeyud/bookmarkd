"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBookmarkd } from "@/lib/store";
import { BookCard } from "@/components/BookCard";
import { StarRating } from "@/components/StarRating";
import { UserBook, Book } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import {
  Library as LibraryIcon,
  LayoutGrid,
  List as ListIcon,
  Search,
  SlidersHorizontal,
  Bookmark,
  Clock,
  Check,
  XCircle,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
} from "lucide-react";

export default function LibraryPage() {
  const router = useRouter();
  const {
    books,
    userBooks,
    currentUser,
    updateReadingProgress,
    removeUserBook,
    openLogModal,
  } = useBookmarkd();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "title" | "author">("recent");
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  // Get books in user's library
  const myUserBooks = userBooks.filter((ub) => ub.user_id === currentUser.id);

  const myBooksWithDetails: { userBook: UserBook; book: Book }[] = myUserBooks
    .map((ub) => ({
      userBook: ub,
      book: books.find((b) => b.id === ub.book_id)!,
    }))
    .filter((item) => item.book !== undefined);

  // Tab counts
  const countAll = myBooksWithDetails.length;
  const countCurrentlyReading = myBooksWithDetails.filter(
    (item) => item.userBook.status === "currently_reading"
  ).length;
  const countWantToRead = myBooksWithDetails.filter(
    (item) => item.userBook.status === "want_to_read"
  ).length;
  const countRead = myBooksWithDetails.filter(
    (item) => item.userBook.status === "read"
  ).length;
  const countDnf = myBooksWithDetails.filter(
    (item) => item.userBook.status === "dnf"
  ).length;

  // Filtered and sorted books
  const filtered = myBooksWithDetails
    .filter(({ userBook, book }) => {
      if (activeTab !== "all" && userBook.status !== activeTab) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          book.title.toLowerCase().includes(q) ||
          book.author.toLowerCase().includes(q) ||
          (userBook.notes && userBook.notes.toLowerCase().includes(q));
        if (!matches) return false;
      }

      if (selectedGenre !== "All") {
        if (!book.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") {
        return (b.userBook.rating || 0) - (a.userBook.rating || 0);
      }
      if (sortBy === "title") {
        return a.book.title.localeCompare(b.book.title);
      }
      if (sortBy === "author") {
        return a.book.author.localeCompare(b.book.author);
      }
      return new Date(b.userBook.updated_at).getTime() - new Date(a.userBook.updated_at).getTime();
    });

  const allLibraryGenres = Array.from(
    new Set(myBooksWithDetails.flatMap((item) => item.book.genres))
  );

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-6">
      {/* Page Header */}
      <PageHeader
        kicker="Personal Reading Archive"
        title="My Reading Library"
        description={`${countAll} volumes tracked across your literary journey.`}
        action={
          <Button
            onClick={() => openLogModal()}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Book to Library
          </Button>
        }
      />

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[#E8DDCE]">
        {[
          { id: "all", label: "All Books", count: countAll, icon: LibraryIcon },
          { id: "currently_reading", label: "Currently Reading", count: countCurrentlyReading, icon: Clock },
          { id: "read", label: "Read", count: countRead, icon: Check },
          { id: "want_to_read", label: "Want to Read", count: countWantToRead, icon: Bookmark },
          { id: "dnf", label: "DNF", count: countDnf, icon: XCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-3.5 border-b-2 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? "border-[#6E3511] text-[#6E3511]"
                  : "border-transparent text-[#7A6F65] hover:text-[#2C221A]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-[#6E3511] text-[#FCECD8]" : "bg-[#EAE0D3] text-[#7A6F65]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search, Filter, Sort & View Mode Toolbar */}
      <div className="p-4 rounded-xl bg-white border border-[#E7DCCE] flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C7D70]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, author, or notes..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[#D8C9B9] bg-[#FAF5ED] text-xs focus:outline-hidden focus:border-[#6E3511]"
            />
          </div>

          {/* Genre select */}
          {allLibraryGenres.length > 0 && (
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-[#D8C9B9] bg-[#FAF5ED] text-xs font-medium"
            >
              <option value="All">All Genres</option>
              {allLibraryGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          )}

          {/* Sort select */}
          <div className="flex items-center gap-1.5 text-[#7A6F65]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "rating" | "title" | "author")}
              className="px-2.5 py-1.5 rounded-lg border border-[#D8C9B9] bg-[#FAF5ED] text-xs font-medium text-[#2C221A]"
            >
              <option value="recent">Recently Updated</option>
              <option value="rating">My Highest Rated</option>
              <option value="title">Title (A - Z)</option>
              <option value="author">Author (A - Z)</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle: Grid or List */}
        <div className="flex items-center p-0.5 rounded-lg bg-[#FAF5ED] border border-[#D8C9B9]">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === "grid" ? "bg-white text-[#6E3511] shadow-2xs" : "text-[#8C7D70]"
            }`}
            title="Grid view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === "list" ? "bg-white text-[#6E3511] shadow-2xs" : "text-[#8C7D70]"
            }`}
            title="List view"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shelf Content */}
      {filtered.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {filtered.map(({ book, userBook }) => (
              <div key={book.id} className="space-y-1">
                <BookCard book={book} size="md" />
                {userBook.progress_pages > 0 && userBook.status === "currently_reading" && (
                  <div className="px-1 text-[10px] text-[#597928] font-bold">
                    {Math.round((userBook.progress_pages / (book.page_count || 1)) * 100)}% read
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Detailed List View with Progress Tracker */
          <div className="space-y-3">
            {filtered.map(({ userBook, book }) => {
              const totalPages = book.page_count || 300;
              const percent = Math.min(
                100,
                Math.round(((userBook.progress_pages || 0) / totalPages) * 100)
              );

              return (
                <div
                  key={book.id}
                  className="p-4 rounded-xl bg-white border border-[#E7DCCE] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <Link href={`/book/${book.id}`} className="shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-14 h-20 object-cover rounded shadow-2xs book-spine-effect"
                      />
                    </Link>
                    <div className="space-y-1">
                      <Link
                        href={`/book/${book.id}`}
                        className="font-serif text-sm font-bold text-[#2C221A] hover:text-[#6E3511]"
                      >
                        {book.title}
                      </Link>
                      <p className="text-xs text-[#7A6F65]">{book.author}</p>
                      <div className="flex items-center gap-2 pt-0.5">
                        <StarRating rating={userBook.rating || book.avg_rating} size="sm" />
                        {userBook.rating && (
                          <span className="text-[11px] font-bold text-[#597928]">
                            (Rated {userBook.rating}★)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reading Progress Controls */}
                  <div className="w-full sm:w-64 space-y-2">
                    {userBook.status === "currently_reading" && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] text-[#7A6F65]">
                          <span>
                            {userBook.progress_pages} / {totalPages} pages
                          </span>
                          <span className="font-bold text-[#597928]">{percent}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max={totalPages}
                          value={userBook.progress_pages}
                          onChange={(e) =>
                            updateReadingProgress(book.id, parseInt(e.target.value))
                          }
                          className="w-full accent-[#597928] cursor-pointer"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-[#8C7D70]">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {userBook.status === "read" && userBook.finish_date
                            ? `Finished ${userBook.finish_date}`
                            : userBook.start_date
                            ? `Started ${userBook.start_date}`
                            : `Updated ${new Date(userBook.updated_at).toLocaleDateString()}`}
                        </span>
                      </div>

                      <Badge
                        variant={
                          userBook.status === "read"
                            ? "forest"
                            : userBook.status === "currently_reading"
                            ? "reading"
                            : userBook.status === "want_to_read"
                            ? "default"
                            : "dnf"
                        }
                        size="sm"
                      >
                        {userBook.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Button
                      onClick={() => openLogModal(book)}
                      variant="outline"
                      size="xs"
                    >
                      Edit Log
                    </Button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${book.title} from library?`)) {
                          removeUserBook(book.id);
                        }
                      }}
                      className="p-1.5 text-[#B3A495] hover:text-rose-700 cursor-pointer"
                      title="Remove from library"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        <EmptyState
          icon={<BookOpen className="w-7 h-7 text-[#6E3511]" />}
          title="No books in this shelf yet"
          description="Discover thousands of literary titles and add them to your reading shelf with one click."
          actionLabel="Explore Discover Catalog"
          onAction={() => {
            router.push("/discover");
          }}
        />
      )}
    </div>
  );
}
