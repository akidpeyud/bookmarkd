import { UserBook } from "@/types";
import { INITIAL_USER_BOOKS, CURRENT_USER } from "../mockData";
import { supabase, isSupabaseConfigured } from "../supabase";

const GLOBAL_STORAGE_KEY = "bookmarkd_user_books";

export const libraryService = {
  // Get user books scoped by user ID
  getUserBooks(userId?: string): UserBook[] {
    if (typeof window === "undefined") return INITIAL_USER_BOOKS;
    try {
      if (userId && userId !== "guest-reader") {
        const scoped = localStorage.getItem(`bookmarkd:user:${userId}:user_books`);
        if (scoped) return JSON.parse(scoped);

        // If demo persona dwiputra, return initial seed data
        if (userId === CURRENT_USER.id) {
          return INITIAL_USER_BOOKS;
        }
        return [];
      }

      // Fallback to global store
      const stored = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return INITIAL_USER_BOOKS;
  },

  // Save user books scoped by user ID
  saveUserBooks(books: UserBook[], userId?: string): void {
    if (typeof window === "undefined") return;
    try {
      if (userId && userId !== "guest-reader") {
        localStorage.setItem(`bookmarkd:user:${userId}:user_books`, JSON.stringify(books));
      }
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  },

  async syncUserBookToCloud(userBook: UserBook): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("user_books").upsert({
          id: userBook.id,
          user_id: userBook.user_id,
          book_id: userBook.book_id,
          status: userBook.status,
          rating: userBook.rating,
          progress_pages: userBook.progress_pages,
          start_date: userBook.start_date,
          finish_date: userBook.finish_date,
          notes: userBook.notes,
          updated_at: userBook.updated_at,
        });
      } catch (err) {
        console.warn("UserBook cloud sync skipped:", err);
      }
    }
  },

  async deleteUserBookFromCloud(userId: string, bookId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("user_books")
          .delete()
          .match({ user_id: userId, book_id: bookId });
      } catch (err) {
        console.warn("UserBook cloud delete skipped:", err);
      }
    }
  },
};
