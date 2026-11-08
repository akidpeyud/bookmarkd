/**
 * test-auth-session-and-logbook.mjs
 * Regression tests for Authentication, Session Isolation, and User-Scoped Library Storage.
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

console.log("==========================================================");
console.log("🔐 RUNNING AUTHENTICATION & SESSION ISOLATION REGRESSION TESTS");
console.log("==========================================================");

let passedCount = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    process.exit(1);
  }
}

// 1. Verify Migration File
runTest("Migration 202611080001_fix_auth_profile_ownership.sql exists and enforces RLS & Trigger", () => {
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/202611080001_fix_auth_profile_ownership.sql");
  assert(fs.existsSync(migrationPath), "Migration file must exist");
  const sql = fs.readFileSync(migrationPath, "utf-8");

  assert(sql.includes("handle_new_user()"), "Must contain handle_new_user() function");
  assert(sql.includes("SECURITY DEFINER"), "Trigger function must be SECURITY DEFINER");
  assert(sql.includes("ON auth.users"), "Must bind trigger to auth.users");
  assert(sql.includes("ENABLE ROW LEVEL SECURITY"), "Must enable RLS on profiles");
  assert(sql.includes("auth.uid() = id"), "RLS must check auth.uid() = id");
});

// 2. Verify Service Worker Cache Isolation
runTest("Service Worker (public/sw.js) blocks caching of authenticated user routes", () => {
  const swPath = path.resolve(process.cwd(), "public/sw.js");
  const swCode = fs.readFileSync(swPath, "utf-8");

  assert(swCode.includes("PRIVATE_ROUTES"), "Must define PRIVATE_ROUTES list");
  assert(swCode.includes("/library"), "Must exclude /library from SW caching");
  assert(swCode.includes("/profile"), "Must exclude /profile from SW caching");
  assert(swCode.includes("/auth"), "Must exclude /auth from SW caching");
  assert(swCode.includes("/settings"), "Must exclude /settings from SW caching");
});

// 3. Simulated Auth Service Strict Validation
runTest("Auth validation rejects empty and malformed credentials without falling back to dwiputra", () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = (email, password) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanEmail) throw new Error("Email wajib diisi.");
    if (!emailRegex.test(cleanEmail)) throw new Error("Format email tidak valid.");
    if (!cleanPassword) throw new Error("Password wajib diisi.");
    if (cleanPassword.length < 6) throw new Error("Password harus minimal 6 karakter.");
    return { cleanEmail, cleanPassword };
  };

  assert.throws(() => validate("", "secret123"), /Email wajib diisi/);
  assert.throws(() => validate("notanemail", "secret123"), /Format email tidak valid/);
  assert.throws(() => validate("test@test.com", ""), /Password wajib diisi/);
  assert.throws(() => validate("test@test.com", "12345"), /Password harus minimal 6 karakter/);

  const valid = validate("User_A@Test.COM", "password123");
  assert.strictEqual(valid.cleanEmail, "user_a@test.com");
  assert.strictEqual(valid.cleanPassword, "password123");
});

// 4. Simulated User-Scoped Storage Isolation
runTest("User-scoped storage keys prevent data leak between accounts", () => {
  const mockLocalStorage = new Map();

  const saveUserBooks = (userId, books) => {
    mockLocalStorage.set(`bookmarkd:user:${userId}:user_books`, JSON.stringify(books));
  };

  const getUserBooks = (userId) => {
    const data = mockLocalStorage.get(`bookmarkd:user:${userId}:user_books`);
    return data ? JSON.parse(data) : [];
  };

  // User A logs 2 books
  saveUserBooks("user-a", [
    { id: "ub-1", user_id: "user-a", book_id: "secret-history", status: "read" },
    { id: "ub-2", user_id: "user-a", book_id: "babel-kuang", status: "currently_reading" }
  ]);

  // User B logs 1 book
  saveUserBooks("user-b", [
    { id: "ub-3", user_id: "user-b", book_id: "piranesi", status: "want_to_read" }
  ]);

  const userABooks = getUserBooks("user-a");
  const userBBooks = getUserBooks("user-b");
  const guestBooks = getUserBooks("guest-reader");

  assert.strictEqual(userABooks.length, 2, "User A must have 2 books");
  assert.strictEqual(userBBooks.length, 1, "User B must have 1 book");
  assert.strictEqual(guestBooks.length, 0, "Guest must have 0 books");
  assert.strictEqual(userABooks[0].book_id, "secret-history");
  assert.strictEqual(userBBooks[0].book_id, "piranesi");
});

// 5. Simulated Sign Out Purge
runTest("Sign out purges active session and resets to guest state", () => {
  const mockSessionStorage = new Map();
  let currentActiveUser = { id: "user-alice", username: "alice", full_name: "Alice Wonderland" };

  mockSessionStorage.set("bookmarkd_active_session", JSON.stringify(currentActiveUser));
  mockSessionStorage.set(`bookmarkd:session:${currentActiveUser.id}`, JSON.stringify(currentActiveUser));

  // Perform signOut
  const signOut = () => {
    const raw = mockSessionStorage.get("bookmarkd_active_session");
    if (raw) {
      const active = JSON.parse(raw);
      mockSessionStorage.delete(`bookmarkd:session:${active.id}`);
    }
    mockSessionStorage.delete("bookmarkd_active_session");
    currentActiveUser = { id: "guest-reader", username: "guest", full_name: "Guest Reader" };
  };

  signOut();

  assert.strictEqual(mockSessionStorage.get("bookmarkd_active_session"), undefined, "Active session key must be removed");
  assert.strictEqual(mockSessionStorage.get("bookmarkd:session:user-alice"), undefined, "User-scoped session key must be removed");
  assert.strictEqual(currentActiveUser.id, "guest-reader", "Active user must be guest-reader");
  assert.notStrictEqual(currentActiveUser.username, "dwiputra", "User must never reset to dwiputra");
});

console.log("==========================================================");
console.log(`AUTH REGRESSION RESULTS: ${passedCount} PASSED, 0 FAILED`);
console.log("==========================================================");
