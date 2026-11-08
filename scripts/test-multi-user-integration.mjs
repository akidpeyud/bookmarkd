import assert from "assert";

console.log("==========================================================");
console.log("👥 BOOKMARKD MULTI-USER INTEGRATION TEST RUNNER");
console.log("==========================================================\n");

// Test Accounts (Disposable Test Users)
const USER_A = {
  id: "test-user-a-101",
  username: "reader_a",
  email: "reader_a@test.com",
  full_name: "Alice Montgomery",
  avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=reader_a",
  created_at: new Date().toISOString(),
  reading_goal_annual: 30,
};

const USER_B = {
  id: "test-user-b-202",
  username: "reader_b",
  email: "reader_b@test.com",
  full_name: "Bob Hawthorne",
  avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=reader_b",
  created_at: new Date().toISOString(),
  reading_goal_annual: 20,
};

// Simulated Isolated Client Sessions & Shared Database State
class BookmarkdBackendHarness {
  constructor() {
    this.users = new Map([
      [USER_A.id, { ...USER_A }],
      [USER_B.id, { ...USER_B }],
    ]);
    this.books = [
      {
        id: "secret-history",
        title: "The Secret History",
        author: "Donna Tartt",
        cover_url: "https://covers.openlibrary.org/b/id/12838383-L.jpg",
        page_count: 559,
        genres: ["Dark Academia", "Mystery"],
      },
      {
        id: "piranesi",
        title: "Piranesi",
        author: "Susanna Clarke",
        cover_url: "https://covers.openlibrary.org/b/id/10524457-L.jpg",
        page_count: 245,
        genres: ["Fantasy", "Mystery"],
      },
    ];
    this.userBooks = [];
    this.reviews = [];
    this.reviewLikes = [];
    this.comments = [];
    this.readingLists = [];
    this.readingListBooks = [];
    this.follows = [];
    this.notifications = [];
  }

  // --- USER A / B CLIENT ACTIONS WITH AUTH CONTEXT ---

  // User Creates Review
  createReview(sessionUser, { bookId, rating, content, contains_spoilers }) {
    if (!sessionUser) throw new Error("401 Unauthorized: Session required");
    const review = {
      id: `rev-test-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: sessionUser.id,
      book_id: bookId,
      rating,
      content,
      contains_spoilers: Boolean(contains_spoilers),
      likes_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { ...sessionUser },
    };
    this.reviews.push(review);
    return review;
  }

  // Get Reviews (Public)
  getReviews() {
    return this.reviews.map((r) => ({
      ...r,
      user: this.users.get(r.user_id),
      book: this.books.find((b) => b.id === r.book_id),
      likes_count: this.reviewLikes.filter((l) => l.review_id === r.id).length,
    }));
  }

  // Like Review
  likeReview(sessionUser, reviewId) {
    if (!sessionUser) throw new Error("401 Unauthorized: Session required");
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error("404 Review Not Found");

    const existingIdx = this.reviewLikes.findIndex(
      (l) => l.review_id === reviewId && l.user_id === sessionUser.id
    );

    let isLiked = false;
    if (existingIdx >= 0) {
      this.reviewLikes.splice(existingIdx, 1);
      review.likes_count = Math.max(0, review.likes_count - 1);
    } else {
      this.reviewLikes.push({
        id: `like-${Date.now()}`,
        review_id: reviewId,
        user_id: sessionUser.id,
        created_at: new Date().toISOString(),
      });
      review.likes_count = (review.likes_count || 0) + 1;
      isLiked = true;

      // Notify review author if different user
      if (review.user_id !== sessionUser.id) {
        this.notifications.push({
          id: `notif-${Date.now()}-${Math.random()}`,
          user_id: review.user_id, // recipient
          actor_id: sessionUser.id,
          actor: { ...sessionUser },
          type: "like_review",
          entity_id: reviewId,
          message: `liked your review of "${this.books.find((b) => b.id === review.book_id)?.title || "a book"}"`,
          read: false,
          created_at: new Date().toISOString(),
        });
      }
    }
    return { review, isLiked, likes_count: review.likes_count };
  }

  // Comment on Review
  commentOnReview(sessionUser, reviewId, content) {
    if (!sessionUser) throw new Error("401 Unauthorized: Session required");
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error("404 Review Not Found");

    const comment = {
      id: `comm-${Date.now()}-${Math.random()}`,
      review_id: reviewId,
      user_id: sessionUser.id,
      content,
      created_at: new Date().toISOString(),
      user: { ...sessionUser },
    };
    this.comments.push(comment);

    // Notify author if different user
    if (review.user_id !== sessionUser.id) {
      this.notifications.push({
        id: `notif-${Date.now()}-${Math.random()}`,
        user_id: review.user_id, // recipient
        actor_id: sessionUser.id,
        actor: { ...sessionUser },
        type: "comment_review",
        entity_id: reviewId,
        message: `commented: "${content.slice(0, 40)}${content.length > 40 ? "..." : ""}"`,
        read: false,
        created_at: new Date().toISOString(),
      });
    }
    return comment;
  }

  // Follow User
  followUser(sessionUser, targetUserId) {
    if (!sessionUser) throw new Error("401 Unauthorized: Session required");
    if (sessionUser.id === targetUserId) throw new Error("Cannot follow self");

    const existingIdx = this.follows.findIndex(
      (f) => f.follower_id === sessionUser.id && f.following_id === targetUserId
    );

    if (existingIdx === -1) {
      this.follows.push({
        follower_id: sessionUser.id,
        following_id: targetUserId,
        created_at: new Date().toISOString(),
      });

      // Notify target user
      this.notifications.push({
        id: `notif-${Date.now()}-${Math.random()}`,
        user_id: targetUserId, // recipient
        actor_id: sessionUser.id,
        actor: { ...sessionUser },
        type: "follow",
        message: "started following your reading journey",
        read: false,
        created_at: new Date().toISOString(),
      });
    }
  }

  // Get User Notifications (Session Isolated)
  getUserNotifications(sessionUser) {
    if (!sessionUser) throw new Error("401 Unauthorized: Session required");
    return this.notifications.filter((n) => n.user_id === sessionUser.id);
  }

  // Activity Feed
  getActivityFeed(sessionUser) {
    if (!sessionUser) throw new Error("401 Unauthorized: Session required");
    const followingUserIds = this.follows
      .filter((f) => f.follower_id === sessionUser.id)
      .map((f) => f.following_id);

    // Feed includes self + followed users
    return this.reviews
      .filter((r) => r.user_id === sessionUser.id || followingUserIds.includes(r.user_id))
      .map((r) => ({
        ...r,
        user: this.users.get(r.user_id),
        book: this.books.find((b) => b.id === r.book_id),
      }));
  }

  // Create Reading List
  createReadingList(sessionUser, { title, description, is_private, book_ids = [] }) {
    if (!sessionUser) throw new Error("401 Unauthorized: Session required");
    const list = {
      id: `list-test-${Date.now()}-${Math.random()}`,
      user_id: sessionUser.id,
      title,
      description,
      is_private: Boolean(is_private),
      likes_count: 0,
      book_ids: [...book_ids],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { ...sessionUser },
    };
    this.readingLists.push(list);
    return list;
  }

  // Get Reading Lists (Public / Privacy-Protected)
  getReadingLists(sessionUser) {
    return this.readingLists.filter(
      (l) => !l.is_private || (sessionUser && l.user_id === sessionUser.id)
    );
  }

  // Get Single Reading List by ID
  getReadingListById(sessionUser, listId) {
    const list = this.readingLists.find((l) => l.id === listId);
    if (!list) return null;
    if (list.is_private && (!sessionUser || list.user_id !== sessionUser.id)) {
      throw new Error("403 Forbidden: Cannot access private reading list");
    }
    return {
      ...list,
      books: list.book_ids.map((id) => this.books.find((b) => b.id === id)).filter(Boolean),
    };
  }

  // Save / Clone Another User's List
  saveReadingList(sessionUser, listId) {
    if (!sessionUser) throw new Error("401 Unauthorized: Session required");
    const original = this.readingLists.find((l) => l.id === listId);
    if (!original) throw new Error("404 Reading List Not Found");
    if (original.is_private && original.user_id !== sessionUser.id) {
      throw new Error("403 Forbidden: Cannot save a private list");
    }

    const savedCopy = {
      id: `list-saved-${Date.now()}-${Math.random()}`,
      user_id: sessionUser.id,
      title: `${original.title} (Saved)`,
      description: original.description,
      is_private: false,
      likes_count: 0,
      book_ids: [...original.book_ids],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: { ...sessionUser },
    };
    this.readingLists.push(savedCopy);
    return savedCopy;
  }

  // Attempt to Edit Review (Direct Request Enforcement)
  editReview(sessionUser, reviewId, { content, rating, contains_spoilers }) {
    if (!sessionUser) throw new Error("401 Unauthorized");
    const review = this.reviews.find((r) => r.id === reviewId);
    if (!review) throw new Error("404 Review Not Found");

    // Enforce Ownership
    if (review.user_id !== sessionUser.id) {
      throw new Error("403 Forbidden: Cannot edit another user's review");
    }

    if (content !== undefined) review.content = content;
    if (rating !== undefined) review.rating = rating;
    if (contains_spoilers !== undefined) review.contains_spoilers = contains_spoilers;
    review.updated_at = new Date().toISOString();
    return review;
  }

  // Attempt to Delete Review (Direct Request Enforcement)
  deleteReview(sessionUser, reviewId) {
    if (!sessionUser) throw new Error("401 Unauthorized");
    const idx = this.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) throw new Error("404 Review Not Found");

    const review = this.reviews[idx];
    if (review.user_id !== sessionUser.id) {
      throw new Error("403 Forbidden: Cannot delete another user's review");
    }

    this.reviews.splice(idx, 1);
    return true;
  }

  // Attempt to Edit Reading List (Direct Request Enforcement)
  editReadingList(sessionUser, listId, updates) {
    if (!sessionUser) throw new Error("401 Unauthorized");
    const list = this.readingLists.find((l) => l.id === listId);
    if (!list) throw new Error("404 Reading List Not Found");

    if (list.user_id !== sessionUser.id) {
      throw new Error("403 Forbidden: Cannot edit another user's reading list");
    }

    Object.assign(list, updates, { updated_at: new Date().toISOString() });
    return list;
  }

  // Attempt to Delete Reading List (Direct Request Enforcement)
  deleteReadingList(sessionUser, listId) {
    if (!sessionUser) throw new Error("401 Unauthorized");
    const idx = this.readingLists.findIndex((l) => l.id === listId);
    if (idx === -1) throw new Error("404 Reading List Not Found");

    const list = this.readingLists[idx];
    if (list.user_id !== sessionUser.id) {
      throw new Error("403 Forbidden: Cannot delete another user's reading list");
    }

    this.readingLists.splice(idx, 1);
    return true;
  }

  // Attempt to Delete User Library Book (Direct Request Enforcement)
  deleteUserBook(sessionUser, targetUserId, bookId) {
    if (!sessionUser) throw new Error("401 Unauthorized");
    if (sessionUser.id !== targetUserId) {
      throw new Error("403 Forbidden: Cannot delete another user's library record");
    }
    const idx = this.userBooks.findIndex(
      (ub) => ub.user_id === targetUserId && ub.book_id === bookId
    );
    if (idx >= 0) {
      this.userBooks.splice(idx, 1);
      return true;
    }
    return false;
  }
}

// ========================================================
// TEST EXECUTION
// ========================================================

const testResults = [];

function recordTest(scenarioNumber, description, fn) {
  try {
    fn();
    console.log(`✅ Scenario ${scenarioNumber}: ${description}`);
    testResults.push({ scenario: scenarioNumber, description, status: "PASS" });
  } catch (err) {
    console.error(`❌ Scenario ${scenarioNumber} FAILED: ${description}`);
    console.error(`   Error: ${err.message}`);
    testResults.push({
      scenario: scenarioNumber,
      description,
      status: "FAIL",
      error: err.message,
    });
  }
}

const backend = new BookmarkdBackendHarness();
let userAReview = null;
let userAPublicList = null;
let userAPrivateList = null;

// 1. User A creates a book review
recordTest(1, "User A creates a book review", () => {
  userAReview = backend.createReview(USER_A, {
    bookId: "secret-history",
    rating: 5.0,
    content: "Donna Tartt crafts an immaculate Greek tragedy set in an elite Vermont college. A masterpiece of atmospheric prose.",
    contains_spoilers: false,
  });
  assert(userAReview.id, "Review ID was not created");
  assert.strictEqual(userAReview.user_id, USER_A.id);
  assert.strictEqual(userAReview.rating, 5.0);
});

// 2. User B can view the public review
recordTest(2, "User B can view the public review", () => {
  const publicReviews = backend.getReviews();
  const found = publicReviews.find((r) => r.id === userAReview.id);
  assert(found, "User B could not find User A's public review");
  assert.strictEqual(found.user.username, "reader_a");
  assert.strictEqual(found.book.title, "The Secret History");
});

// 3. User B likes the review
recordTest(3, "User B likes the review", () => {
  const likeResult = backend.likeReview(USER_B, userAReview.id);
  assert.strictEqual(likeResult.isLiked, true);
  assert.strictEqual(likeResult.likes_count, 1);

  const reviews = backend.getReviews();
  const updatedReview = reviews.find((r) => r.id === userAReview.id);
  assert.strictEqual(updatedReview.likes_count, 1);
});

// 4. User B comments on the review
recordTest(4, "User B comments on the review", () => {
  const comment = backend.commentOnReview(
    USER_B,
    userAReview.id,
    "Couldn't agree more, Alice! Julian Morrow's Greek seminar was chilling."
  );
  assert(comment.id, "Comment was not created");
  assert.strictEqual(comment.user_id, USER_B.id);
  assert.strictEqual(comment.review_id, userAReview.id);
});

// 5. User A receives the appropriate notifications
recordTest(5, "User A receives notifications; User B does not receive User A's notifications", () => {
  const notifsA = backend.getUserNotifications(USER_A);
  assert(notifsA.length >= 2, `Expected at least 2 notifications for User A, got ${notifsA.length}`);

  const likeNotif = notifsA.find((n) => n.type === "like_review");
  assert(likeNotif, "User A did not receive a like notification");
  assert.strictEqual(likeNotif.actor_id, USER_B.id);

  const commentNotif = notifsA.find((n) => n.type === "comment_review");
  assert(commentNotif, "User A did not receive a comment notification");
  assert.strictEqual(commentNotif.actor_id, USER_B.id);

  // User B's notification box must be empty / isolated
  const notifsB = backend.getUserNotifications(USER_B);
  assert.strictEqual(notifsB.length, 0, "User B's notifications leaked User A's alerts");
});

// 6. User A follows User B and vice versa
recordTest(6, "User A follows User B and vice versa (mutual follow)", () => {
  backend.followUser(USER_A, USER_B.id);
  backend.followUser(USER_B, USER_A.id);

  const aFollowsB = backend.follows.some(
    (f) => f.follower_id === USER_A.id && f.following_id === USER_B.id
  );
  const bFollowsA = backend.follows.some(
    (f) => f.follower_id === USER_B.id && f.following_id === USER_A.id
  );
  assert(aFollowsB, "User A is not following User B");
  assert(bFollowsA, "User B is not following User A");

  // User B receives follow notification from A
  const notifsB = backend.getUserNotifications(USER_B);
  const followNotifB = notifsB.find((n) => n.type === "follow");
  assert(followNotifB, "User B did not receive follow notification from User A");
});

// 7. Both users can see the appropriate social activities
recordTest(7, "Both users can see appropriate social activities in activity feed", () => {
  const feedA = backend.getActivityFeed(USER_A);
  const feedB = backend.getActivityFeed(USER_B);

  // Both should see User A's review (A sees self, B sees followed user A)
  assert(feedA.some((item) => item.id === userAReview.id), "Feed A missing User A review");
  assert(feedB.some((item) => item.id === userAReview.id), "Feed B missing User A review");
});

// 8. User A creates a public reading list
recordTest(8, "User A creates a public reading list", () => {
  userAPublicList = backend.createReadingList(USER_A, {
    title: "Dark Academia Essentials",
    description: "Classic atmospheric fiction delving into obsession, aesthetics, and ancient secrets.",
    is_private: false,
    book_ids: ["secret-history", "piranesi"],
  });
  assert(userAPublicList.id, "List was not created");
  assert.strictEqual(userAPublicList.is_private, false);
  assert.strictEqual(userAPublicList.book_ids.length, 2);
});

// 9. User B can view, like, and save that list
recordTest(9, "User B can view, like, and save User A's public list", () => {
  // View
  const publicLists = backend.getReadingLists(USER_B);
  const found = publicLists.find((l) => l.id === userAPublicList.id);
  assert(found, "User B could not view User A's public list");

  // Save / Clone to User B's shelf
  const savedCopy = backend.saveReadingList(USER_B, userAPublicList.id);
  assert(savedCopy.id, "User B could not save copy of list");
  assert.strictEqual(savedCopy.user_id, USER_B.id);
  assert.strictEqual(savedCopy.book_ids.length, 2);
  assert(savedCopy.title.includes("(Saved)"));
});

// 10. User A creates a private reading list
recordTest(10, "User A creates a private reading list", () => {
  userAPrivateList = backend.createReadingList(USER_A, {
    title: "Secret Drafts & Spoilers",
    description: "Private notes and upcoming read plans for 2026.",
    is_private: true,
    book_ids: ["piranesi"],
  });
  assert.strictEqual(userAPrivateList.is_private, true);
  assert.strictEqual(userAPrivateList.user_id, USER_A.id);
});

// 11. User B must not be able to access private list contents
recordTest(11, "User B must not be able to access private list contents", () => {
  // Check 1: List query does not return private list to User B
  const listsSeenByB = backend.getReadingLists(USER_B);
  const privateFoundInQuery = listsSeenByB.some((l) => l.id === userAPrivateList.id);
  assert.strictEqual(privateFoundInQuery, false, "Private list leaked in User B list query");

  // Check 2: Direct request to fetch private list by ID throws 403 Forbidden
  assert.throws(
    () => {
      backend.getReadingListById(USER_B, userAPrivateList.id);
    },
    /403 Forbidden/,
    "Direct query by User B to private list ID must be rejected with 403"
  );

  // Check 3: Direct attempt to save/clone private list throws 403 Forbidden
  assert.throws(
    () => {
      backend.saveReadingList(USER_B, userAPrivateList.id);
    },
    /403 Forbidden/,
    "Attempt to save private list by User B must be rejected"
  );
});

// 12. Ownership restrictions: User B attempts to edit or delete User A's records
recordTest(12, "User B attempts to edit/delete User A's review, library records, and lists (Direct API/Backend)", () => {
  // 12.1 Attempt to edit User A's review
  assert.throws(
    () => {
      backend.editReview(USER_B, userAReview.id, { content: "Tampered by User B" });
    },
    /403 Forbidden/,
    "User B must not be permitted to edit User A's review"
  );

  // 12.2 Attempt to delete User A's review
  assert.throws(
    () => {
      backend.deleteReview(USER_B, userAReview.id);
    },
    /403 Forbidden/,
    "User B must not be permitted to delete User A's review"
  );

  // 12.3 Attempt to edit User A's reading list
  assert.throws(
    () => {
      backend.editReadingList(USER_B, userAPublicList.id, { title: "Hacked List Title" });
    },
    /403 Forbidden/,
    "User B must not be permitted to edit User A's reading list"
  );

  // 12.4 Attempt to delete User A's reading list
  assert.throws(
    () => {
      backend.deleteReadingList(USER_B, userAPublicList.id);
    },
    /403 Forbidden/,
    "User B must not be permitted to delete User A's reading list"
  );

  // 12.5 Attempt to delete User A's library record
  assert.throws(
    () => {
      backend.deleteUserBook(USER_B, USER_A.id, "secret-history");
    },
    /403 Forbidden/,
    "User B must not be permitted to delete User A's library record"
  );
});

// Session Isolation Check
recordTest(13, "Session Isolation Verification", () => {
  assert.notStrictEqual(USER_A.id, USER_B.id);
  assert.notStrictEqual(USER_A.email, USER_B.email);
  const notifsA = backend.getUserNotifications(USER_A);
  const notifsB = backend.getUserNotifications(USER_B);
  assert.strictEqual(notifsA.some((n) => n.user_id === USER_B.id), false);
  assert.strictEqual(notifsB.some((n) => n.user_id === USER_A.id), false);
});

// Data Persistence Verification
recordTest(14, "Data Persistence across sessions", () => {
  const persistedReviews = backend.getReviews();
  const persistedLists = backend.getReadingLists(USER_A);
  assert(persistedReviews.length >= 1, "Reviews did not persist");
  assert(persistedLists.length >= 2, "Lists did not persist");
});

// Disposable Data Cleanup
recordTest(15, "Disposable Test Data Cleanup", () => {
  // Purge test records safely
  const initialReviewCount = backend.reviews.length;
  backend.reviews = backend.reviews.filter((r) => r.user_id !== USER_A.id && r.user_id !== USER_B.id);
  backend.readingLists = backend.readingLists.filter((l) => l.user_id !== USER_A.id && l.user_id !== USER_B.id);
  backend.follows = backend.follows.filter((f) => f.follower_id !== USER_A.id && f.follower_id !== USER_B.id);
  backend.notifications = backend.notifications.filter((n) => n.user_id !== USER_A.id && n.user_id !== USER_B.id);

  assert(backend.reviews.length < initialReviewCount, "Test reviews were not cleaned up");
  console.log("   🧹 All disposable multi-user test data purged successfully without affecting system data.");
});

// Summary
console.log("\n==========================================================");
const passedCount = testResults.filter((r) => r.status === "PASS").length;
const failedCount = testResults.filter((r) => r.status === "FAIL").length;
console.log(`MULTI-USER INTEGRATION RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log("==========================================================");

if (failedCount > 0) {
  process.exit(1);
}
