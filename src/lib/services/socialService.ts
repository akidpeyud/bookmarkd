import { Review, ReviewComment, ReadingList } from "@/types";
import { INITIAL_REVIEWS, INITIAL_READING_LISTS } from "../mockData";
import { supabase, isSupabaseConfigured } from "../supabase";

const REVIEWS_KEY = "bookmarkd_reviews";
const COMMENTS_KEY = "bookmarkd_comments";
const LISTS_KEY = "bookmarkd_lists";
const FOLLOWS_KEY = "bookmarkd_following";

export const socialService = {
  // --- REVIEWS ---
  getReviews(): Review[] {
    if (typeof window === "undefined") return INITIAL_REVIEWS;
    try {
      const stored = localStorage.getItem(REVIEWS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return INITIAL_REVIEWS;
  },

  saveReviews(reviews: Review[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  },

  async syncReviewToCloud(review: Review): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("reviews").upsert({
          id: review.id,
          user_id: review.user_id,
          book_id: review.book_id,
          rating: review.rating,
          content: review.content,
          contains_spoilers: review.contains_spoilers,
          likes_count: review.likes_count,
          created_at: review.created_at,
          updated_at: review.updated_at || review.created_at,
        });
      } catch (err) {
        console.warn("Review cloud sync skipped:", err);
      }
    }
  },

  async deleteReviewFromCloud(reviewId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from("reviews").delete().eq("id", reviewId);
        if (userId) query = query.eq("user_id", userId);
        await query;
      } catch (err) {
        console.warn("Review cloud delete skipped:", err);
      }
    }
  },

  // --- COMMENTS ---
  getComments(): Record<string, ReviewComment[]> {
    if (typeof window === "undefined") return {};
    try {
      const stored = localStorage.getItem(COMMENTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return {};
  },

  saveComments(comments: Record<string, ReviewComment[]>): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  },

  // --- LISTS ---
  getLists(): ReadingList[] {
    if (typeof window === "undefined") return INITIAL_READING_LISTS;
    try {
      const stored = localStorage.getItem(LISTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return INITIAL_READING_LISTS;
  },

  saveLists(lists: ReadingList[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  },

  async syncListToCloud(list: ReadingList): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("reading_lists").upsert({
          id: list.id,
          user_id: list.user_id,
          title: list.title,
          description: list.description,
          is_private: list.is_private,
          likes_count: list.likes_count,
          created_at: list.created_at,
          updated_at: list.updated_at,
        });
      } catch (err) {
        console.warn("List cloud sync skipped:", err);
      }
    }
  },

  async deleteListFromCloud(listId: string, userId?: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from("reading_lists").delete().eq("id", listId);
        if (userId) query = query.eq("user_id", userId);
        await query;
      } catch (err) {
        console.warn("List cloud delete skipped:", err);
      }
    }
  },

  // --- FOLLOWS ---
  getFollowing(): string[] {
    if (typeof window === "undefined") return ["user-clara", "user-julian"];
    try {
      const stored = localStorage.getItem(FOLLOWS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Storage read error:", e);
    }
    return ["user-clara", "user-julian"];
  },

  saveFollowing(following: string[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(FOLLOWS_KEY, JSON.stringify(following));
    } catch (e) {
      console.warn("Storage write error:", e);
    }
  },

  async syncFollowToCloud(followerId: string, followingId: string, isFollow: boolean): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        if (isFollow) {
          await supabase.from("follows").insert({
            follower_id: followerId,
            following_id: followingId,
          });
        } else {
          await supabase.from("follows").delete().match({
            follower_id: followerId,
            following_id: followingId,
          });
        }
      } catch (err) {
        console.warn("Follow cloud sync skipped:", err);
      }
    }
  },
};
