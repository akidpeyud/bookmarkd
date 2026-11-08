"use client";

import React, { useState } from "react";
import { Book } from "@/types";
import { useBookmarkd } from "@/lib/store";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ListPlus, Check, Plus, BookOpen, Lock, Globe } from "lucide-react";

export interface AddToListModalProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToListModal({ book, isOpen, onClose }: AddToListModalProps) {
  const { lists, currentUser, addBookToList, removeBookFromList, createList } = useBookmarkd();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  if (!book) return null;

  const myLists = lists.filter((l) => l.user_id === currentUser.id);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createList(newTitle.trim(), newDesc.trim(), isPrivate, [book.id]);
    setNewTitle("");
    setNewDesc("");
    setIsPrivate(false);
    setIsCreating(false);
  };

  const toggleBookInList = (listId: string, hasBook: boolean) => {
    if (hasBook) {
      removeBookFromList(listId, book.id);
    } else {
      addBookToList(listId, book.id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      subtitle="Curated Collections"
      title={`Add "${book.title}" to Reading List`}
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Book mini header */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white border border-[#E7DCCE]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-10 h-14 object-cover rounded shadow-xs shrink-0"
          />
          <div className="overflow-hidden">
            <h4 className="font-serif text-xs font-bold text-[#2C221A] line-clamp-1">
              {book.title}
            </h4>
            <p className="text-[11px] text-[#7A6F65]">{book.author}</p>
          </div>
        </div>

        {/* Existing Lists Checklist */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511]">
            Your Lists ({myLists.length})
          </label>

          {myLists.length === 0 ? (
            <div className="p-4 rounded-xl bg-white border border-dashed border-[#D8C9B9] text-center text-xs text-[#7A6F65]">
              You haven&apos;t created any reading lists yet.
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto space-y-1.5 p-1">
              {myLists.map((list) => {
                const hasBook = list.book_ids.includes(book.id);

                return (
                  <div
                    key={list.id}
                    onClick={() => toggleBookInList(list.id, hasBook)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      hasBook
                        ? "bg-[#EFF4E7] border-[#91AC67] text-[#2C221A]"
                        : "bg-white border-[#E7DCCE] hover:border-[#6E3511]"
                    }`}
                  >
                    <div className="overflow-hidden space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs truncate">
                          {list.title}
                        </span>
                        {list.is_private ? (
                          <Lock className="w-3 h-3 text-amber-700 shrink-0" />
                        ) : (
                          <Globe className="w-3 h-3 text-[#597928] shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-[#7A6F65] block">
                        {list.book_ids.length} books
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors ${
                        hasBook
                          ? "bg-[#597928] border-[#597928] text-white"
                          : "border-[#D8C9B9] bg-white"
                      }`}
                    >
                      {hasBook && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create new list form inline */}
        {isCreating ? (
          <form
            onSubmit={handleCreateList}
            className="p-4 rounded-xl bg-white border border-[#E7DCCE] space-y-3 animate-fadeIn"
          >
            <h5 className="font-serif text-xs font-bold text-[#6E3511] uppercase tracking-wider">
              Create New List
            </h5>

            <Input
              type="text"
              required
              placeholder="List Title (e.g. Victorian Dark Romance)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />

            <textarea
              rows={2}
              placeholder="Description or curator thoughts..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-[#D8C9B9] bg-[#FAF5ED]"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="modal-private-check"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="accent-[#6E3511] rounded cursor-pointer"
              />
              <label
                htmlFor="modal-private-check"
                className="text-xs text-[#4A3E35] cursor-pointer"
              >
                Keep list private
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="xs"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="xs">
                Create & Add Book
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            leftIcon={<Plus className="w-4 h-4 text-[#6E3511]" />}
            onClick={() => setIsCreating(true)}
          >
            Create New Reading List
          </Button>
        )}

        <div className="pt-2 flex justify-end">
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
