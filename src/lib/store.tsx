"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Book,
  UserProfile,
  UserBook,
  Review,
  ReviewComment,
  ReadingList,
  ReadingStatus,
  NotificationItem,
} from "@/types";
import {
  INITIAL_BOOKS,
  CURRENT_USER,
  COMMUNITY_USERS,
  INITIAL_USER_BOOKS,
  INITIAL_REVIEWS,
  INITIAL_READING_LISTS,
  INITIAL_NOTIFICATIONS,
} from "./mockData";
import { isSupabaseConfigured } from "./supabase";
import { authService } from "./services/authService";
import { booksService } from "./services/booksService";
import { libraryService } from "./services/libraryService";
import { socialService } from "./services/socialService";
import { notificationsService } from "./services/notificationsService";

interface BookmarkdContextType {
  currentUser: UserProfile;
  communityUsers: UserProfile[];
  books: Book[];
  userBooks: UserBook[];
  reviews: Review[];
  comments: Record<string, ReviewComment[]>;
  lists: ReadingList[];
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  followingIds: string[];
  isConfiguredWithSupabase: boolean;

  // Authentication
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (fullName: string, username: string, email: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchUser: (userId: string) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  getUserProfile: (idOrUsername: string) => UserProfile | undefined;

  // Book Catalog
  addOrGetBook: (book: Book) => Book;
  getBook: (id: string) => Book | undefined;
  searchCatalog: (query: string) => Promise<Book[]>;

  // Library & Reading Statuses
  getUserBook: (bookId: string) => UserBook | undefined;
  updateReadingStatus: (
    bookId: string,
    status: ReadingStatus,
    extra?: Partial<UserBook>
  ) => void;
  removeUserBook: (bookId: string) => void;
  updateReadingProgress: (bookId: string, pages: number) => void;

  // Reviews & Ratings
  addReview: (
    bookId: string,
    rating: number,
    content: string,
    contains_spoilers: boolean
  ) => Review;
  editReview: (
    reviewId: string,
    content: string,
    rating: number,
    contains_spoilers: boolean
  ) => void;
  deleteReview: (reviewId: string) => void;
  likeReview: (reviewId: string) => void;
  addReviewComment: (reviewId: string, content: string) => void;

  // Reading Lists
  createList: (
    title: string,
    description: string,
    is_private: boolean,
    book_ids?: string[]
  ) => ReadingList;
  updateList: (listId: string, updates: Partial<ReadingList>) => void;
  deleteList: (listId: string) => void;
  addBookToList: (listId: string, bookId: string) => void;
  removeBookFromList: (listId: string, bookId: string) => void;
  likeList: (listId: string) => void;
  saveList: (listId: string) => ReadingList | null;

  // Social & Follows
  followUser: (targetUserId: string) => void;
  unfollowUser: (targetUserId: string) => void;
  isFollowing: (userId: string) => boolean;

  // Annual Challenge
  setAnnualGoal: (target: number) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Quick Log modal
  isLogModalOpen: boolean;
  logModalBook: Book | null;
  openLogModal: (book?: Book) => void;
  closeLogModal: () => void;

  // Toast
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const BookmarkdContext = createContext<BookmarkdContextType | undefined>(undefined);

export function BookmarkdProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile>(CURRENT_USER);
  const [communityUsers, setCommunityUsers] = useState<UserProfile[]>(COMMUNITY_USERS);
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);
  const [userBooks, setUserBooks] = useState<UserBook[]>(INITIAL_USER_BOOKS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [comments, setComments] = useState<Record<string, ReviewComment[]>>({
    "rev-1": [
      {
        id: "c-1",
        review_id: "rev-1",
        user_id: "user-clara",
        content: "Couldn't agree more about Julian Morrow! Tartt's prose is unmatched.",
        created_at: "2026-01-15T09:20:00Z",
      },
    ],
  });
  const [lists, setLists] = useState<ReadingList[]>(INITIAL_READING_LISTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [followingIds, setFollowingIds] = useState<string[]>(["user-clara", "user-julian"]);

  // Modals & toast
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logModalBook, setLogModalBook] = useState<Book | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize from services / localStorage on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const activeUser = authService.getSession();
        if (activeUser) setCurrentUser(activeUser);

        const storedBooks = booksService.getAllBooks();
        if (storedBooks?.length) setBooks(storedBooks);

        const storedUserBooks = libraryService.getUserBooks();
        if (storedUserBooks?.length) setUserBooks(storedUserBooks);

        const storedReviews = localStorage.getItem("bookmarkd_reviews");
        if (storedReviews) setReviews(JSON.parse(storedReviews));

        const storedLists = localStorage.getItem("bookmarkd_lists");
        if (storedLists) setLists(JSON.parse(storedLists));

        const storedFollowing = localStorage.getItem("bookmarkd_following");
        if (storedFollowing) setFollowingIds(JSON.parse(storedFollowing));

        const storedNotifs = notificationsService.getAllNotifications();
        if (storedNotifs?.length) setNotifications(storedNotifs);
      } catch (e) {
        console.warn("Could not load initial store data:", e);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const persist = useCallback((key: string, data: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // --- AUTHENTICATION ---
  const signIn = useCallback(
    async (email: string, password?: string) => {
      const user = await authService.signIn(email, password);
      setCurrentUser(user);
      showToast(`Welcome back, ${user.full_name}!`);
    },
    [showToast]
  );

  const signUp = useCallback(
    async (fullName: string, username: string, email: string, password?: string) => {
      const user = await authService.signUp(fullName, username, email, password);
      setCurrentUser(user);
      setCommunityUsers((prev) => [...prev, user]);
      showToast(`Welcome to Bookmarkd, ${user.full_name}! Account created.`);
    },
    [showToast]
  );

  const signOut = useCallback(async () => {
    await authService.signOut();
    setCurrentUser(CURRENT_USER);
    showToast("Signed out. Switched to guest mode.");
  }, [showToast]);

  const switchUser = useCallback(
    (userId: string) => {
      const found = communityUsers.find((u) => u.id === userId);
      if (found) {
        setCurrentUser(found);
        authService.saveSession(found);
        showToast(`Switched account to @${found.username}`);
      }
    },
    [communityUsers, showToast]
  );

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      setCurrentUser((prev) => {
        const updated = { ...prev, ...updates };
        authService.saveSession(updated);
        return updated;
      });
      showToast("Profile settings saved");
    },
    [showToast]
  );

  const getUserProfile = useCallback(
    (idOrUsername: string): UserProfile | undefined => {
      if (currentUser.id === idOrUsername || currentUser.username === idOrUsername) {
        return currentUser;
      }
      return communityUsers.find(
        (u) => u.id === idOrUsername || u.username === idOrUsername
      );
    },
    [currentUser, communityUsers]
  );

  // --- BOOKS CATALOG ---
  const addOrGetBook = useCallback(
    (newBook: Book): Book => {
      setBooks((prev) => {
        const existing = prev.find(
          (b) => b.id === newBook.id || (b.isbn && b.isbn === newBook.isbn)
        );
        if (existing) return prev;
        const updated = [newBook, ...prev];
        booksService.saveBooks(updated);
        booksService.syncBookToCloud(newBook);
        return updated;
      });
      return newBook;
    },
    []
  );

  const getBook = useCallback(
    (id: string) => {
      return books.find((b) => b.id === id);
    },
    [books]
  );

  const searchCatalog = useCallback(
    async (query: string) => {
      return booksService.searchBooks(query, books);
    },
    [books]
  );

  // --- LIBRARY & READING STATUSES ---
  const getUserBook = useCallback(
    (bookId: string) => {
      return userBooks.find((ub) => ub.user_id === currentUser.id && ub.book_id === bookId);
    },
    [userBooks, currentUser.id]
  );

  const updateReadingStatus = useCallback(
    (bookId: string, status: ReadingStatus, extra?: Partial<UserBook>) => {
      setUserBooks((prev) => {
        const existingIdx = prev.findIndex(
          (ub) => ub.user_id === currentUser.id && ub.book_id === bookId
        );
        let updated: UserBook[];
        const now = new Date().toISOString();

        if (existingIdx >= 0) {
          const current = prev[existingIdx];
          const updatedItem: UserBook = {
            ...current,
            status,
            updated_at: now,
            ...extra,
          };
          if (status === "read" && !updatedItem.finish_date) {
            updatedItem.finish_date = new Date().toISOString().split("T")[0];
          }
          if (status === "currently_reading" && !updatedItem.start_date) {
            updatedItem.start_date = new Date().toISOString().split("T")[0];
          }
          updated = [...prev];
          updated[existingIdx] = updatedItem;
          libraryService.syncUserBookToCloud(updatedItem);
        } else {
          const newItem: UserBook = {
            id: `ub-${Date.now()}`,
            user_id: currentUser.id,
            book_id: bookId,
            status,
            progress_pages: extra?.progress_pages || 0,
            start_date: status === "currently_reading" ? new Date().toISOString().split("T")[0] : undefined,
            finish_date: status === "read" ? new Date().toISOString().split("T")[0] : undefined,
            created_at: now,
            updated_at: now,
            ...extra,
          };
          updated = [newItem, ...prev];
          libraryService.syncUserBookToCloud(newItem);
        }

        libraryService.saveUserBooks(updated);
        return updated;
      });

      const readableStatus = {
        want_to_read: "Want to Read",
        currently_reading: "Currently Reading",
        read: "Read",
        dnf: "Did Not Finish (DNF)",
      }[status];

      showToast(`Updated to "${readableStatus}"`);
    },
    [currentUser.id, showToast]
  );

  const removeUserBook = useCallback(
    (bookId: string) => {
      setUserBooks((prev) => {
        const updated = prev.filter(
          (ub) => !(ub.user_id === currentUser.id && ub.book_id === bookId)
        );
        libraryService.saveUserBooks(updated);
        libraryService.deleteUserBookFromCloud(currentUser.id, bookId);
        return updated;
      });
      showToast("Book removed from your library");
    },
    [currentUser.id, showToast]
  );

  const updateReadingProgress = useCallback(
    (bookId: string, pages: number) => {
      setUserBooks((prev) => {
        const idx = prev.findIndex(
          (ub) => ub.user_id === currentUser.id && ub.book_id === bookId
        );
        if (idx === -1) return prev;
        const targetBook = books.find((b) => b.id === bookId);
        const maxPages = targetBook?.page_count || 1000;
        const clampedPages = Math.min(Math.max(0, pages), maxPages);

        const updated = [...prev];
        const item = { ...updated[idx], progress_pages: clampedPages, updated_at: new Date().toISOString() };
        if (clampedPages >= maxPages && item.status !== "read") {
          item.status = "read";
          item.finish_date = new Date().toISOString().split("T")[0];
        }
        updated[idx] = item;
        libraryService.saveUserBooks(updated);
        libraryService.syncUserBookToCloud(item);
        return updated;
      });
      showToast(`Progress logged: ${pages} pages`);
    },
    [currentUser.id, books, showToast]
  );

  // --- REVIEWS & RATINGS ---
  const addReview = useCallback(
    (bookId: string, rating: number, content: string, contains_spoilers: boolean): Review => {
      const newReview: Review = {
        id: `rev-${Date.now()}`,
        user_id: currentUser.id,
        book_id: bookId,
        rating,
        content,
        contains_spoilers,
        likes_count: 0,
        liked_by_me: false,
        created_at: new Date().toISOString(),
        comments_count: 0,
        user: currentUser,
        book: books.find((b) => b.id === bookId),
      };

      setReviews((prev) => {
        const updated = [newReview, ...prev];
        persist("bookmarkd_reviews", updated);
        return updated;
      });

      updateReadingStatus(bookId, "read", { rating });
      showToast("Review published!");
      return newReview;
    },
    [currentUser, books, persist, updateReadingStatus, showToast]
  );

  const editReview = useCallback(
    (reviewId: string, content: string, rating: number, contains_spoilers: boolean) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (target && target.user_id !== currentUser.id) {
        showToast("Permission denied: You can only edit your own reviews");
        return;
      }

      setReviews((prev) => {
        const updated = prev.map((r) =>
          r.id === reviewId
            ? { ...r, content, rating, contains_spoilers, updated_at: new Date().toISOString() }
            : r
        );
        persist("bookmarkd_reviews", updated);
        const edited = updated.find((r) => r.id === reviewId);
        if (edited) socialService.syncReviewToCloud(edited);
        return updated;
      });
      showToast("Review updated");
    },
    [currentUser.id, reviews, persist, showToast]
  );

  const deleteReview = useCallback(
    (reviewId: string) => {
      const target = reviews.find((r) => r.id === reviewId);
      if (target && target.user_id !== currentUser.id) {
        showToast("Permission denied: You can only delete your own reviews");
        return;
      }

      setReviews((prev) => {
        const updated = prev.filter((r) => r.id !== reviewId);
        persist("bookmarkd_reviews", updated);
        socialService.deleteReviewFromCloud(reviewId);
        return updated;
      });
      showToast("Review deleted");
    },
    [currentUser.id, reviews, persist, showToast]
  );

  const likeReview = useCallback(
    (reviewId: string) => {
      let isNowLiked = false;
      let targetAuthorId = "";
      let targetBookTitle = "a book";

      setReviews((prev) => {
        const updated = prev.map((r) => {
          if (r.id === reviewId) {
            const liked = !r.liked_by_me;
            isNowLiked = liked;
            targetAuthorId = r.user_id;
            const b = books.find((x) => x.id === r.book_id);
            if (b) targetBookTitle = b.title;

            return {
              ...r,
              liked_by_me: liked,
              likes_count: liked ? r.likes_count + 1 : Math.max(0, r.likes_count - 1),
            };
          }
          return r;
        });
        persist("bookmarkd_reviews", updated);
        return updated;
      });

      // Dispatch notification to review author if liked by another user
      if (isNowLiked && targetAuthorId && targetAuthorId !== currentUser.id) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id: targetAuthorId,
          actor_id: currentUser.id,
          actor: currentUser,
          type: "like_review",
          entity_id: reviewId,
          message: `liked your review of "${targetBookTitle}"`,
          read: false,
          created_at: new Date().toISOString(),
        };
        setNotifications((prev) => {
          const updated = [notif, ...prev];
          notificationsService.saveNotifications(updated);
          notificationsService.syncNotificationToCloud(notif);
          return updated;
        });
      }
    },
    [currentUser, books, persist]
  );

  const addReviewComment = useCallback(
    (reviewId: string, content: string) => {
      const newComment: ReviewComment = {
        id: `c-${Date.now()}`,
        review_id: reviewId,
        user_id: currentUser.id,
        content,
        created_at: new Date().toISOString(),
        user: currentUser,
      };

      setComments((prev) => {
        const list = prev[reviewId] || [];
        const updated = {
          ...prev,
          [reviewId]: [...list, newComment],
        };
        persist("bookmarkd_comments", updated);
        return updated;
      });

      const targetReview = reviews.find((r) => r.id === reviewId);

      setReviews((prev) => {
        const updated = prev.map((r) =>
          r.id === reviewId ? { ...r, comments_count: (r.comments_count || 0) + 1 } : r
        );
        persist("bookmarkd_reviews", updated);
        return updated;
      });

      // Dispatch notification to review author if not commenting on own review
      if (targetReview && targetReview.user_id !== currentUser.id) {
        const notif: NotificationItem = {
          id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          user_id: targetReview.user_id,
          actor_id: currentUser.id,
          actor: currentUser,
          type: "comment_review",
          entity_id: reviewId,
          message: `commented: "${content.slice(0, 40)}${content.length > 40 ? "..." : ""}"`,
          read: false,
          created_at: new Date().toISOString(),
        };
        setNotifications((prev) => {
          const updated = [notif, ...prev];
          notificationsService.saveNotifications(updated);
          notificationsService.syncNotificationToCloud(notif);
          return updated;
        });
      }

      showToast("Comment posted");
    },
    [currentUser, reviews, persist, showToast]
  );

  // --- LISTS ---
  const createList = useCallback(
    (title: string, description: string, is_private: boolean, book_ids: string[] = []): ReadingList => {
      const newList: ReadingList = {
        id: `list-${Date.now()}`,
        user_id: currentUser.id,
        title,
        description,
        is_private,
        likes_count: 0,
        liked_by_me: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        book_ids,
        user: currentUser,
      };

      setLists((prev) => {
        const updated = [newList, ...prev];
        persist("bookmarkd_lists", updated);
        return updated;
      });
      showToast(`Created reading list "${title}"`);
      return newList;
    },
    [currentUser, persist, showToast]
  );

  const updateList = useCallback(
    (listId: string, updates: Partial<ReadingList>) => {
      const target = lists.find((l) => l.id === listId);
      if (target && target.user_id !== currentUser.id) {
        showToast("Permission denied: You can only edit your own reading lists");
        return;
      }

      setLists((prev) => {
        const updated = prev.map((l) =>
          l.id === listId
            ? { ...l, ...updates, updated_at: new Date().toISOString() }
            : l
        );
        persist("bookmarkd_lists", updated);
        const edited = updated.find((l) => l.id === listId);
        if (edited) socialService.syncListToCloud(edited);
        return updated;
      });
      showToast("Reading list updated");
    },
    [currentUser.id, lists, persist, showToast]
  );

  const deleteList = useCallback(
    (listId: string) => {
      const target = lists.find((l) => l.id === listId);
      if (target && target.user_id !== currentUser.id) {
        showToast("Permission denied: You can only delete your own reading lists");
        return;
      }

      setLists((prev) => {
        const updated = prev.filter((l) => l.id !== listId);
        persist("bookmarkd_lists", updated);
        socialService.deleteListFromCloud(listId);
        return updated;
      });
      showToast("Reading list deleted");
    },
    [currentUser.id, lists, persist, showToast]
  );

  const addBookToList = useCallback(
    (listId: string, bookId: string) => {
      const target = lists.find((l) => l.id === listId);
      if (target && target.user_id !== currentUser.id) {
        showToast("Permission denied: You can only modify books in your own lists");
        return;
      }

      setLists((prev) => {
        const updated = prev.map((l) => {
          if (l.id === listId) {
            if (l.book_ids.includes(bookId)) return l;
            return { ...l, book_ids: [...l.book_ids, bookId], updated_at: new Date().toISOString() };
          }
          return l;
        });
        persist("bookmarkd_lists", updated);
        return updated;
      });
      showToast("Book added to list");
    },
    [currentUser.id, lists, persist, showToast]
  );

  const removeBookFromList = useCallback(
    (listId: string, bookId: string) => {
      const target = lists.find((l) => l.id === listId);
      if (target && target.user_id !== currentUser.id) {
        showToast("Permission denied: You can only modify books in your own lists");
        return;
      }

      setLists((prev) => {
        const updated = prev.map((l) => {
          if (l.id === listId) {
            return {
              ...l,
              book_ids: l.book_ids.filter((id) => id !== bookId),
              updated_at: new Date().toISOString(),
            };
          }
          return l;
        });
        persist("bookmarkd_lists", updated);
        return updated;
      });
      showToast("Book removed from list");
    },
    [currentUser.id, lists, persist, showToast]
  );

  const likeList = useCallback(
    (listId: string) => {
      setLists((prev) => {
        const updated = prev.map((l) => {
          if (l.id === listId) {
            const liked = !l.liked_by_me;
            return {
              ...l,
              liked_by_me: liked,
              likes_count: liked ? l.likes_count + 1 : Math.max(0, l.likes_count - 1),
            };
          }
          return l;
        });
        persist("bookmarkd_lists", updated);
        return updated;
      });
    },
    [persist]
  );

  const saveList = useCallback(
    (listId: string): ReadingList | null => {
      const original = lists.find((l) => l.id === listId);
      if (!original) {
        showToast("Reading list not found");
        return null;
      }
      if (original.is_private && original.user_id !== currentUser.id) {
        showToast("Permission denied: Cannot save a private reading list");
        return null;
      }

      const savedCopy: ReadingList = {
        id: `list-saved-${Date.now()}`,
        user_id: currentUser.id,
        title: `${original.title} (Saved)`,
        description: original.description,
        is_private: false,
        likes_count: 0,
        liked_by_me: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        book_ids: [...original.book_ids],
        user: currentUser,
      };

      setLists((prev) => {
        const updated = [savedCopy, ...prev];
        persist("bookmarkd_lists", updated);
        socialService.syncListToCloud(savedCopy);
        return updated;
      });
      showToast(`Saved "${original.title}" to your library`);
      return savedCopy;
    },
    [lists, currentUser, persist, showToast]
  );

  // --- SOCIAL & FOLLOWS ---
  const followUser = useCallback(
    (targetUserId: string) => {
      if (targetUserId === currentUser.id) return;

      setFollowingIds((prev) => {
        if (prev.includes(targetUserId)) return prev;
        const updated = [...prev, targetUserId];
        persist("bookmarkd_following", updated);
        socialService.syncFollowToCloud(currentUser.id, targetUserId, true);
        return updated;
      });

      // Dispatch follow notification to the target user
      const notif: NotificationItem = {
        id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: targetUserId,
        actor_id: currentUser.id,
        actor: currentUser,
        type: "follow",
        message: "started following your reading journey",
        read: false,
        created_at: new Date().toISOString(),
      };
      setNotifications((prev) => {
        const updated = [notif, ...prev];
        notificationsService.saveNotifications(updated);
        notificationsService.syncNotificationToCloud(notif);
        return updated;
      });

      showToast("Reader followed");
    },
    [currentUser, persist, showToast]
  );

  const unfollowUser = useCallback(
    (targetUserId: string) => {
      setFollowingIds((prev) => {
        const updated = prev.filter((id) => id !== targetUserId);
        persist("bookmarkd_following", updated);
        return updated;
      });
      showToast("Unfollowed");
    },
    [persist, showToast]
  );

  const isFollowing = useCallback(
    (userId: string) => followingIds.includes(userId),
    [followingIds]
  );

  // --- ANNUAL CHALLENGE ---
  const setAnnualGoal = useCallback(
    (target: number) => {
      updateProfile({ reading_goal_annual: target });
      showToast(`2026 Reading Goal set to ${target} books!`);
    },
    [updateProfile, showToast]
  );

  // --- NOTIFICATIONS ---
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  }, [showToast]);

  // --- QUICK LOG MODAL ---
  const openLogModal = useCallback((book?: Book) => {
    if (book) setLogModalBook(book);
    setIsLogModalOpen(true);
  }, []);

  const closeLogModal = useCallback(() => {
    setIsLogModalOpen(false);
    setLogModalBook(null);
  }, []);

  const unreadNotifsCount = notifications.filter(
    (n) => !n.read && (n.user_id === currentUser.id || !n.user_id)
  ).length;

  return (
    <BookmarkdContext.Provider
      value={{
        currentUser,
        communityUsers,
        books,
        userBooks,
        reviews,
        comments,
        lists,
        notifications,
        unreadNotifsCount,
        followingIds,
        isConfiguredWithSupabase: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        switchUser,
        updateProfile,
        getUserProfile,
        addOrGetBook,
        getBook,
        searchCatalog,
        getUserBook,
        updateReadingStatus,
        removeUserBook,
        updateReadingProgress,
        addReview,
        editReview,
        deleteReview,
        likeReview,
        addReviewComment,
        createList,
        updateList,
        deleteList,
        addBookToList,
        removeBookFromList,
        likeList,
        saveList,
        followUser,
        unfollowUser,
        isFollowing,
        setAnnualGoal,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isLogModalOpen,
        logModalBook,
        openLogModal,
        closeLogModal,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </BookmarkdContext.Provider>
  );
}

export function useBookmarkd() {
  const context = useContext(BookmarkdContext);
  if (!context) {
    throw new Error("useBookmarkd must be used within a BookmarkdProvider");
  }
  return context;
}
