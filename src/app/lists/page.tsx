"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { BookCard } from "@/components/BookCard";
import { ReadingList, Book } from "@/types";
import {
  ListOrdered,
  Plus,
  Heart,
  Lock,
  Globe,
  Trash2,
  X,
  BookOpen,
  Check,
} from "lucide-react";

export default function ReadingListsPage() {
  const {
    lists,
    books,
    currentUser,
    createList,
    deleteList,
    removeBookFromList,
    likeList,
    getUserProfile,
  } = useBookmarkd();

  const [activeTab, setActiveTab] = useState<"all" | "my">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [newListPrivate, setNewListPrivate] = useState(false);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
  const [selectedListForModal, setSelectedListForModal] = useState<ReadingList | null>(null);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    createList(newListTitle.trim(), newListDesc.trim(), newListPrivate, selectedBookIds);
    setNewListTitle("");
    setNewListDesc("");
    setNewListPrivate(false);
    setSelectedBookIds([]);
    setIsCreateOpen(false);
  };

  const displayedLists = lists.filter((list) => {
    if (activeTab === "my") return list.user_id === currentUser.id;
    // Show all public lists plus the user's private lists
    return !list.is_private || list.user_id === currentUser.id;
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDCE] pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
            Curated Collections
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A]">
            Reading Lists
          </h1>
          <p className="text-xs text-[#7A6F65] mt-0.5">
            Discover themed book stacks or assemble your personal reading canon.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6E3511] hover:bg-[#592B0E] text-[#FCECD8] text-xs font-bold shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New List</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-[#E8DDCE] text-xs font-semibold">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === "all"
              ? "border-[#6E3511] text-[#6E3511]"
              : "border-transparent text-[#7A6F65] hover:text-[#2C221A]"
          }`}
        >
          Featured & Community Lists ({lists.filter((l) => !l.is_private).length})
        </button>
        <button
          onClick={() => setActiveTab("my")}
          className={`pb-2.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === "my"
              ? "border-[#6E3511] text-[#6E3511]"
              : "border-transparent text-[#7A6F65] hover:text-[#2C221A]"
          }`}
        >
          My Created Lists ({lists.filter((l) => l.user_id === currentUser.id).length})
        </button>
      </div>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedLists.map((list) => {
          const author = list.user || getUserProfile(list.user_id) || currentUser;
          const isOwner = list.user_id === currentUser.id;
          const listBooks = list.book_ids
            .map((id) => books.find((b) => b.id === id))
            .filter(Boolean) as Book[];

          return (
            <div
              key={list.id}
              className="p-5 rounded-2xl bg-white border border-[#E7DCCE] shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#7A6F65]">
                    {list.is_private ? (
                      <span className="inline-flex items-center gap-1 text-amber-800 font-medium">
                        <Lock className="w-3 h-3" /> Private List
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[#597928] font-medium">
                        <Globe className="w-3 h-3" /> Public
                      </span>
                    )}
                  </div>

                  {isOwner && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete reading list "${list.title}"?`)) {
                          deleteList(list.id);
                        }
                      }}
                      className="text-[#B3A495] hover:text-rose-700 p-1 cursor-pointer"
                      title="Delete list"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <h3
                    onClick={() => setSelectedListForModal(list)}
                    className="font-serif text-base font-bold text-[#2C221A] group-hover:text-[#6E3511] cursor-pointer line-clamp-1"
                  >
                    {list.title}
                  </h3>
                  <p className="text-xs text-[#7A6F65] line-clamp-2 mt-1 leading-relaxed">
                    {list.description}
                  </p>
                </div>

                {/* Staged Cover Gallery */}
                <div
                  onClick={() => setSelectedListForModal(list)}
                  className="pt-2 flex items-center -space-x-4 cursor-pointer overflow-hidden py-1"
                >
                  {listBooks.length > 0 ? (
                    listBooks.slice(0, 5).map((b, i) => (
                      <div
                        key={b.id}
                        className="relative w-12 sm:w-14 h-18 sm:h-20 rounded shadow-md overflow-hidden border-2 border-white transition-transform hover:-translate-y-1 z-10"
                        style={{ zIndex: 10 - i }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={b.cover_url}
                          alt={b.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="p-4 w-full rounded-lg bg-[#FAF5ED] text-center text-xs text-[#9B8E81] italic">
                      Empty list. Click to add books.
                    </div>
                  )}
                </div>
              </div>

              {/* List Footer */}
              <div className="pt-4 mt-4 border-t border-[#F2E9DE] flex items-center justify-between text-xs text-[#7A6F65]">
                <Link
                  href={`/profile/${author.username}`}
                  className="flex items-center gap-2 hover:text-[#6E3511]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={author.avatar_url}
                    alt={author.full_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-medium truncate max-w-[110px]">
                    {author.full_name}
                  </span>
                </Link>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-semibold text-[#8C7D70]">
                    {list.book_ids.length} books
                  </span>

                  <button
                    onClick={() => likeList(list.id)}
                    className={`inline-flex items-center gap-1 font-semibold transition-colors cursor-pointer ${
                      list.liked_by_me ? "text-[#597928]" : "hover:text-[#6E3511]"
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        list.liked_by_me ? "fill-[#597928] text-[#597928]" : ""
                      }`}
                    />
                    <span>{list.likes_count}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create List Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-lg bg-[#FAF5ED] rounded-xl shadow-2xl border border-[#E8DDCE] p-6 text-[#2C221A] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-3">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-[#6E3511]" />
                <h3 className="font-serif text-lg font-bold">New Reading List</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-full hover:bg-[#EFE5D8] cursor-pointer"
              >
                <X className="w-5 h-5 text-[#7A6F65]" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
                  List Title
                </label>
                <input
                  type="text"
                  required
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  placeholder="e.g. Victorian Mysteries, Autumn Melancholy, 2026 TBR"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#D8C9B9] bg-white focus:outline-hidden focus:border-[#6E3511]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
                  Description / Curator Statement
                </label>
                <textarea
                  rows={3}
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                  placeholder="Describe the themes, aesthetic, or intended reading vibe of this collection..."
                  className="w-full p-3 text-xs rounded-lg border border-[#D8C9B9] bg-white focus:outline-hidden focus:border-[#6E3511]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private-check"
                  checked={newListPrivate}
                  onChange={(e) => setNewListPrivate(e.target.checked)}
                  className="accent-[#6E3511] rounded cursor-pointer"
                />
                <label
                  htmlFor="private-check"
                  className="text-xs font-medium text-[#4A3E35] cursor-pointer flex items-center gap-1"
                >
                  <Lock className="w-3.5 h-3.5 text-[#7A6F65]" /> Make this list private (only you can see it)
                </label>
              </div>

              {/* Pick initial books from catalog */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511] mb-1">
                  Select Books to Include
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-white border border-[#D8C9B9]">
                  {books.map((b) => {
                    const isSelected = selectedBookIds.includes(b.id);
                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBookIds((prev) =>
                            isSelected ? prev.filter((id) => id !== b.id) : [...prev, b.id]
                          );
                        }}
                        className={`flex items-center justify-between p-2 rounded text-xs cursor-pointer transition-colors ${
                          isSelected ? "bg-[#EFF4E7] font-semibold text-[#597928]" : "hover:bg-[#FAF5ED]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={b.cover_url} alt="" className="w-6 h-8 object-cover rounded" />
                          <span className="truncate">{b.title}</span>
                          <span className="text-[10px] text-[#8C7D70]">({b.author})</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#597928] shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DDCE]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-[#D8C9B9] bg-white text-[#4A3E35]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#6E3511] hover:bg-[#592B0E] text-[#FCECD8] shadow-md"
                >
                  Publish List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected List Details Modal */}
      {selectedListForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-[#FAF5ED] rounded-xl shadow-2xl border border-[#E8DDCE] p-6 text-[#2C221A] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#E8DDCE] pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
                  Reading List
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-bold">
                  {selectedListForModal.title}
                </h2>
                <p className="text-xs text-[#7A6F65] mt-1">
                  {selectedListForModal.description}
                </p>
              </div>
              <button
                onClick={() => setSelectedListForModal(null)}
                className="p-1.5 rounded-full hover:bg-[#EFE5D8] cursor-pointer"
              >
                <X className="w-5 h-5 text-[#7A6F65]" />
              </button>
            </div>

            {/* List Books Shelf */}
            <div className="mt-5 space-y-4">
              <h4 className="font-serif text-xs font-bold uppercase tracking-wider text-[#6E3511]">
                Books in this Collection ({selectedListForModal.book_ids.length})
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {selectedListForModal.book_ids.map((bId) => {
                  const b = books.find((x) => x.id === bId);
                  if (!b) return null;
                  return (
                    <div key={b.id} className="relative group">
                      <BookCard book={b} size="sm" />
                      {selectedListForModal.user_id === currentUser.id && (
                        <button
                          onClick={() => {
                            removeBookFromList(selectedListForModal.id, b.id);
                            setSelectedListForModal((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    book_ids: prev.book_ids.filter((id) => id !== b.id),
                                  }
                                : null
                            );
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-700 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                          title="Remove from list"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
