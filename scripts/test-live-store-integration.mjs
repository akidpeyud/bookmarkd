import fs from "fs";

console.log("==========================================================");
console.log("🔍 TESTING LIVE PROJECT SOURCE FILES FOR MULTI-USER DEFECTS");
console.log("==========================================================\n");

const storeFile = fs.readFileSync("src/lib/store.tsx", "utf-8");
const notifsPage = fs.readFileSync("src/app/notifications/page.tsx", "utf-8");
const schemaSql = fs.readFileSync("supabase/schema.sql", "utf-8");

const issues = [];

// Check 1: Does store.tsx create a notification when likeReview is called?
if (!storeFile.includes("like_review") || !storeFile.includes("setNotifications")) {
  issues.push({
    id: "DEFECT-01",
    scenario: "Scenario 3 & 5",
    title: "Missing Notification Generation on Review Like",
    evidence: "likeReview in src/lib/store.tsx toggles likes_count but does not dispatch a notification to review.user_id.",
    reproduction: "1. User A publishes a review.\n2. User B clicks like on User A's review.\n3. User A logs in and navigates to /notifications.\n4. Result: Zero new notifications appear for User A.",
  });
}

// Check 2: Does store.tsx create a notification when addReviewComment is called?
if (!storeFile.includes("comment_review") || !storeFile.includes("setNotifications")) {
  issues.push({
    id: "DEFECT-02",
    scenario: "Scenario 4 & 5",
    title: "Missing Notification Generation on Review Comment",
    evidence: "addReviewComment in src/lib/store.tsx appends comment to state but does not dispatch a notification to review.user_id.",
    reproduction: "1. User A publishes a review.\n2. User B submits a comment.\n3. User A checks notifications.\n4. Result: No notification for the comment is registered.",
  });
}

// Check 3: Does store.tsx create a notification when followUser is called?
const followRegex = /followUser\s*=\s*useCallback\([\s\S]*?setNotifications/;
if (!followRegex.test(storeFile)) {
  issues.push({
    id: "DEFECT-03",
    scenario: "Scenario 5 & 6",
    title: "Missing Notification Generation on Follow Action",
    evidence: "followUser in src/lib/store.tsx only updates followingIds and does not notify the target reader.",
    reproduction: "1. User B follows User A.\n2. User A opens notifications.\n3. Result: No 'started following your reading journey' notification created for User A.",
  });
}

// Check 4: Does notifications page isolate notifications per recipient?
if (!notifsPage.includes("n.user_id === currentUser.id") && !storeFile.includes("notifications.filter((n) => n.user_id === currentUser.id)")) {
  issues.push({
    id: "DEFECT-04",
    scenario: "Scenario 5 & Session Isolation",
    title: "Notification Inbox Leaks Other Users' Alerts",
    evidence: "src/app/notifications/page.tsx renders all notifications directly without filtering by currentUser.id.",
    reproduction: "1. User A receives a notification.\n2. User B logs in and opens /notifications.\n3. Result: User B sees User A's private notification stream.",
  });
}

// Check 5: Does editReview verify ownership?
const editReviewOwnership = /editReview[\s\S]*?target[\s\S]*?user_id\s*!==\s*currentUser\.id/;
if (!editReviewOwnership.test(storeFile)) {
  issues.push({
    id: "DEFECT-05",
    scenario: "Scenario 12",
    title: "Unauthorized Review Editing (Missing Backend/Store Ownership Check)",
    evidence: "editReview in src/lib/store.tsx maps directly over reviews without asserting currentUser.id === r.user_id.",
    reproduction: "1. User A creates review 'rev-101'.\n2. User B calls editReview('rev-101', 'Tampered Content', 1.0, false).\n3. Result: User A's review is overwritten by User B.",
  });
}

// Check 6: Does deleteReview verify ownership?
const deleteReviewOwnership = /deleteReview[\s\S]*?target[\s\S]*?user_id\s*!==\s*currentUser\.id/;
if (!deleteReviewOwnership.test(storeFile)) {
  issues.push({
    id: "DEFECT-06",
    scenario: "Scenario 12",
    title: "Unauthorized Review Deletion (Missing Backend/Store Ownership Check)",
    evidence: "deleteReview in src/lib/store.tsx filters by id only without checking currentUser.id === r.user_id.",
    reproduction: "1. User A creates review 'rev-101'.\n2. User B calls deleteReview('rev-101').\n3. Result: User A's review is deleted by User B.",
  });
}

// Check 7: Does deleteList or updateList verify ownership?
const deleteListOwnership = /deleteList[\s\S]*?target[\s\S]*?user_id\s*!==\s*currentUser\.id/;
if (!deleteListOwnership.test(storeFile)) {
  issues.push({
    id: "DEFECT-07",
    scenario: "Scenario 12",
    title: "Unauthorized Reading List Deletion / Modification",
    evidence: "deleteList and updateList in src/lib/store.tsx lack user ownership validation.",
    reproduction: "1. User A creates a reading list 'list-101'.\n2. User B calls deleteList('list-101').\n3. Result: User A's reading list is destroyed by User B.",
  });
}

// Check 8: Does store provide saveList capability for User B?
if (!storeFile.includes("saveList")) {
  issues.push({
    id: "DEFECT-08",
    scenario: "Scenario 9",
    title: "Missing saveList (Clone List to Shelf) Functionality",
    evidence: "store.tsx exposes likeList, but does not provide saveList to clone a curated stack into the user's saved lists.",
    reproduction: "1. User A curates a public stack.\n2. User B desires to save this stack to their library.\n3. Result: Function does not exist.",
  });
}

// Check 9: RLS Policies for review_likes, review_comments, reading_list_books
if (!schemaSql.includes('POLICY "Likes are viewable by everyone"') || !schemaSql.includes('POLICY "Users can insert their own comments"')) {
  issues.push({
    id: "DEFECT-09",
    scenario: "Scenario 3, 4, 11, 12 (Database RLS)",
    title: "Missing Row Level Security Policies for Child Relational Tables",
    evidence: "supabase/schema.sql enables RLS on review_likes, review_comments, reading_list_books without defining PERMISSIVE policies, causing Supabase to reject all non-superuser operations.",
    reproduction: "1. Deploy schema.sql to Supabase.\n2. Authenticated User attempts to like review or add comment.\n3. Result: PostgreSQL raises 'new row violates row-level security policy for table review_likes'.",
  });
}

console.log(`Documented ${issues.length} defect(s) in codebase:\n`);
issues.forEach((issue) => {
  console.log(`----------------------------------------------------------`);
  console.log(`[${issue.id}] ${issue.title} (${issue.scenario})`);
  console.log(`Evidence: ${issue.evidence}`);
  console.log(`Reproduction Steps:\n${issue.reproduction}`);
});
console.log(`----------------------------------------------------------\n`);
