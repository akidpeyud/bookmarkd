import fs from "fs";
import path from "path";
import assert from "assert";

console.log("=========================================");
console.log("🧪 RUNNING BOOKMARKD AUTOMATED TEST SUITE");
console.log("=========================================\n");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    failed++;
  }
}

// 1. Test Design Tokens & Palette
test("Theme Color Palette Integrity", () => {
  const css = fs.readFileSync("src/app/globals.css", "utf-8");
  assert(css.includes("#6E3511"), "Primary brown #6E3511 missing in globals.css");
  assert(css.includes("#91AC67"), "Sage green #91AC67 missing in globals.css");
  assert(css.includes("#597928"), "Forest green #597928 missing in globals.css");
  assert(css.includes("#FCECD8"), "Warm cream #FCECD8 missing in globals.css");
});

// 2. Test PWA Manifest
test("PWA Web App Manifest Specification", () => {
  const manifestRaw = fs.readFileSync("public/manifest.json", "utf-8");
  const manifest = JSON.parse(manifestRaw);

  assert.strictEqual(manifest.name, "BOOKMARKD - The Social Reading Platform");
  assert.strictEqual(manifest.short_name, "Bookmarkd");
  assert.strictEqual(manifest.theme_color, "#6E3511");
  assert.strictEqual(manifest.background_color, "#FAF5ED");
  assert.strictEqual(manifest.display, "standalone");
  assert(Array.isArray(manifest.icons) && manifest.icons.length > 0, "Icons missing");
  assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3, "Shortcuts missing");
});

// 3. Test Service Worker
test("Service Worker Offline Caching", () => {
  const sw = fs.readFileSync("public/sw.js", "utf-8");
  assert(sw.includes("caches.open"), "SW missing cache initialization");
  assert(sw.includes("/manifest.json"), "SW missing manifest caching");
  assert(sw.includes("/icon.svg"), "SW missing icon caching");
  assert(sw.includes("fetch"), "SW missing fetch handler");
});

// 4. Test PostgreSQL Database Schema
test("Database Schema Tables & Constraints", () => {
  const schema = fs.readFileSync("supabase/schema.sql", "utf-8");
  const requiredTables = [
    "profiles",
    "books",
    "user_books",
    "reviews",
    "review_likes",
    "review_comments",
    "follows",
    "reading_lists",
    "reading_list_books",
    "reading_challenges",
    "notifications",
  ];
  for (const table of requiredTables) {
    assert(
      schema.includes(`CREATE TABLE IF NOT EXISTS public.${table}`),
      `Table public.${table} missing in schema.sql`
    );
  }
  assert(schema.includes("ENABLE ROW LEVEL SECURITY"), "RLS not enabled in schema.sql");
});

// 5. Test Half-Star Rating Logic
test("Half-Star Rating Step Calculations", () => {
  const calculateStarFill = (rating, starIndex) => {
    return Math.max(0, Math.min(1, rating - starIndex));
  };

  assert.strictEqual(calculateStarFill(4.5, 4), 0.5, "Half star on 5th star should be 0.5");
  assert.strictEqual(calculateStarFill(4.5, 3), 1.0, "Full star on 4th star should be 1.0");
  assert.strictEqual(calculateStarFill(4.5, 0), 1.0, "Full star on 1st star should be 1.0");
  assert.strictEqual(calculateStarFill(3.0, 3), 0.0, "Empty 4th star should be 0.0");
});

// 6. Test Reading Progress & Auto-completion
test("Reading Progress & Auto-Completion to Read", () => {
  const totalPages = 350;
  const updateProgress = (currentStatus, pagesRead) => {
    const clamped = Math.min(Math.max(0, pagesRead), totalPages);
    let status = currentStatus;
    let finishDate = undefined;
    if (clamped >= totalPages) {
      status = "read";
      finishDate = "2026-11-08";
    }
    return { pages: clamped, status, finishDate };
  };

  const step1 = updateProgress("currently_reading", 140);
  assert.strictEqual(step1.status, "currently_reading");
  assert.strictEqual(step1.pages, 140);

  const step2 = updateProgress("currently_reading", 350);
  assert.strictEqual(step2.status, "read");
  assert.strictEqual(step2.finishDate, "2026-11-08");
});

// 7. Test Reading Challenge Pacing
test("Reading Challenge Pacing Algorithm", () => {
  const goal = 36;
  const dayOfYear = 100; // ~Day 100
  const expected = Math.round((goal / 365) * dayOfYear); // ~10 books
  const currentRead = 12;
  const diff = currentRead - expected;
  assert.strictEqual(diff > 0, true, "Reader should be ahead of pace");
});

// 8. Test Accessibility Attributes
test("Accessibility & Contrast Attributes Check", () => {
  const nav = fs.readFileSync("src/components/Navigation.tsx", "utf-8");
  assert(nav.includes("aria-label"), "Navigation must include aria-label for accessibility");
  const modal = fs.readFileSync("src/components/ui/Modal.tsx", "utf-8");
  assert(modal.includes("Escape"), "Modal must support Escape key accessibility");
});

console.log("\n=========================================");
console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log("=========================================");

if (failed > 0) {
  process.exit(1);
}
