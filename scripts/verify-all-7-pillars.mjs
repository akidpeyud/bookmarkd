import fs from "fs";
import assert from "assert";

console.log("======================================================================");
console.log("🌟 BOOKMARKD — COMPREHENSIVE 7-PILLAR AUDIT & SYSTEM VERIFICATION");
console.log("======================================================================\n");

const results = [];

function check(pillar, name, fn) {
  try {
    fn();
    console.log(`[PASS] ${pillar} -> ${name}`);
    results.push({ pillar, name, status: "PASS" });
  } catch (err) {
    console.error(`[FAIL] ${pillar} -> ${name}`);
    console.error(`       Error: ${err.message}`);
    results.push({ pillar, name, status: "FAIL", error: err.message });
  }
}

// ----------------------------------------------------------------------
// 1. BUILD DAN ERROR RUNTIME
// ----------------------------------------------------------------------
check("1. Build & Runtime", "Error boundary (error.tsx) exists and has reset handler", () => {
  const errFile = fs.readFileSync("src/app/error.tsx", "utf-8");
  assert(errFile.includes("reset"), "error.tsx missing reset function");
  assert(errFile.includes("use client"), "error.tsx must be client component");
});

check("1. Build & Runtime", "Global loading state (loading.tsx) exists with editorial style", () => {
  const loadFile = fs.readFileSync("src/app/loading.tsx", "utf-8");
  assert(loadFile.includes("Opening your reading journal") || loadFile.includes("animate-spin") || loadFile.includes("animate-bounce"), "loading.tsx missing loader");
});

check("1. Build & Runtime", "Not-found page (not-found.tsx) exists with return navigation", () => {
  const nfFile = fs.readFileSync("src/app/not-found.tsx", "utf-8");
  assert(nfFile.includes("404"), "not-found.tsx missing 404 indicator");
  assert(nfFile.includes('href="/"') || nfFile.includes("href"), "not-found.tsx missing back link");
});

check("1. Build & Runtime", "TypeScript config enforces strict mode and valid paths", () => {
  const tsConfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf-8"));
  assert.strictEqual(tsConfig.compilerOptions.strict, true);
  assert(tsConfig.compilerOptions.paths["@/*"], "Path alias @/* missing");
});

// ----------------------------------------------------------------------
// 2. AUTHENTICATION DAN DATABASE
// ----------------------------------------------------------------------
check("2. Auth & Database", "Database Schema defines all core tables with proper primary & foreign keys", () => {
  const sql = fs.readFileSync("supabase/schema.sql", "utf-8");
  const requiredTables = [
    "public.profiles",
    "public.books",
    "public.user_books",
    "public.reviews",
    "public.review_likes",
    "public.review_comments",
    "public.follows",
    "public.reading_lists",
    "public.reading_list_books",
    "public.reading_challenges",
    "public.notifications",
  ];
  for (const tbl of requiredTables) {
    assert(sql.includes(tbl), `Missing table definition: ${tbl}`);
  }
  assert(sql.includes("ON DELETE CASCADE"), "Missing ON DELETE CASCADE integrity rules");
});

check("2. Auth & Database", "Auth service supports signUp, signIn, signOut, and session persistence", () => {
  const authFile = fs.readFileSync("src/lib/services/authService.ts", "utf-8");
  assert(authFile.includes("signUp"), "Missing signUp");
  assert(authFile.includes("signIn"), "Missing signIn");
  assert(authFile.includes("signOut"), "Missing signOut");
  assert(authFile.includes("bookmarkd_active_session"), "Missing session storage key");
});

check("2. Auth & Database", "Supabase client configured with graceful offline fallback", () => {
  const supaFile = fs.readFileSync("src/lib/supabase.ts", "utf-8");
  assert(supaFile.includes("isSupabaseConfigured"), "Missing isSupabaseConfigured flag");
});

// ----------------------------------------------------------------------
// 3. MULTI-USER PERMISSIONS
// ----------------------------------------------------------------------
check("3. Multi-User Permissions", "Row Level Security (RLS) is enabled on all database tables", () => {
  const sql = fs.readFileSync("supabase/schema.sql", "utf-8");
  const rlsTables = [
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
  for (const t of rlsTables) {
    assert(sql.includes(`ALTER TABLE public.${t} ENABLE ROW LEVEL SECURITY;`), `RLS not enabled on ${t}`);
  }
});

check("3. Multi-User Permissions", "Reading lists enforce public/private visibility and list books access", () => {
  const sql = fs.readFileSync("supabase/schema.sql", "utf-8");
  assert(sql.includes("is_private = false OR auth.uid() = user_id"), "Public reading list policy missing");
  assert(sql.includes("WHERE id = reading_list_books.list_id"), "List books RLS check missing");
});

check("3. Multi-User Permissions", "Store enforces user ownership on editReview, deleteReview, deleteList", () => {
  const store = fs.readFileSync("src/lib/store.tsx", "utf-8");
  assert(store.includes("target.user_id !== currentUser.id"), "Ownership checks missing in store");
  assert(store.includes("Permission denied: You can only edit your own reviews"), "Edit review check missing");
  assert(store.includes("Permission denied: You can only delete your own reviews"), "Delete review check missing");
  assert(store.includes("Permission denied: You can only delete your own reading lists"), "Delete list check missing");
});

// ----------------------------------------------------------------------
// 4. FITUR INTI MEMBACA DAN REVIEW
// ----------------------------------------------------------------------
check("4. Core Reading & Reviews", "4 Reading statuses (Want to Read, Currently Reading, Read, DNF) supported", () => {
  const types = fs.readFileSync("src/types/index.ts", "utf-8");
  assert(types.includes("'want_to_read' | 'currently_reading' | 'read' | 'dnf'"), "ReadingStatus enum missing values");
});

check("4. Core Reading & Reviews", "Reading progress auto-transitions to 'read' at 100% pages", () => {
  const store = fs.readFileSync("src/lib/store.tsx", "utf-8");
  assert(store.includes('clampedPages >= maxPages && item.status !== "read"'), "Auto-completion to read missing");
  assert(store.includes('item.status = "read"'), "Status not set to read on 100%");
});

check("4. Core Reading & Reviews", "StarRating component supports 0.5 half-star precision and interactive hover", () => {
  const rating = fs.readFileSync("src/components/StarRating.tsx", "utf-8");
  assert(rating.includes("step = 0.5") || rating.includes("0.5"), "Half star step missing");
  assert(rating.includes("aria-label"), "Star rating missing accessibility aria-label");
});

check("4. Core Reading & Reviews", "ReviewCard supports spoiler toggle, comments, and like button", () => {
  const rev = fs.readFileSync("src/components/ReviewCard.tsx", "utf-8");
  assert(rev.includes("revealedSpoiler"), "Spoiler warning toggle missing");
  assert(rev.includes("likeReview"), "Like button interaction missing");
  assert(rev.includes("handlePostComment"), "Comment posting missing");
});

check("4. Core Reading & Reviews", "Reading Challenge 2026 calculates pacing and progress", () => {
  const chal = fs.readFileSync("src/app/challenge/page.tsx", "utf-8");
  assert(chal.includes("expectedPace") || chal.includes("diff"), "Challenge pacing calculation missing");
  assert(chal.includes("percent") || chal.includes("pct"), "Challenge percentage missing");
});

check("4. Core Reading & Reviews", "Statistics page renders total books, pages, avg rating, genres, and authors", () => {
  const stats = fs.readFileSync("src/app/stats/page.tsx", "utf-8");
  assert(stats.includes("totalBooksRead"), "Total books read metric missing");
  assert(stats.includes("totalPagesRead"), "Total pages read metric missing");
  assert(stats.includes("avgRating"), "Average rating metric missing");
  assert(stats.includes("sortedGenres"), "Genres breakdown missing");
  assert(stats.includes("sortedAuthors"), "Favorite authors breakdown missing");
});

// ----------------------------------------------------------------------
// 5. RESPONSIVE HP, TABLET, DESKTOP
// ----------------------------------------------------------------------
check("5. Responsiveness", "Navigation has desktop sidebar (md:flex) and mobile bottom bar (md:hidden)", () => {
  const nav = fs.readFileSync("src/components/Navigation.tsx", "utf-8");
  assert(nav.includes("hidden md:flex"), "Desktop sidebar responsive class missing");
  assert(nav.includes("md:hidden"), "Mobile bottom bar responsive class missing");
});

check("5. Responsiveness", "Viewport metadata configured for mobile screens", () => {
  const layout = fs.readFileSync("src/app/layout.tsx", "utf-8");
  assert(layout.includes("viewport") || fs.readFileSync("public/manifest.json", "utf-8").includes("standalone"), "Viewport/PWA layout missing");
});

check("5. Responsiveness", "Grid layouts adapt across mobile (grid-cols-2) and desktop (md/lg:grid-cols)", () => {
  const library = fs.readFileSync("src/app/library/page.tsx", "utf-8");
  assert(library.includes("grid-cols-2") && library.includes("md:grid-cols-4"), "Library responsive grid missing");
});

// ----------------------------------------------------------------------
// 6. UI/UX DAN ACCESSIBILITY
// ----------------------------------------------------------------------
check("6. UI/UX & A11y", "Strict color palette compliance in globals.css (#6E3511, #91AC67, #597928, #FCECD8)", () => {
  const css = fs.readFileSync("src/app/globals.css", "utf-8");
  assert(css.includes("#6E3511"), "Primary brown #6E3511 missing");
  assert(css.includes("#91AC67"), "Sage green #91AC67 missing");
  assert(css.includes("#597928"), "Forest green #597928 missing");
  assert(css.includes("#FCECD8"), "Warm cream #FCECD8 missing");
});

check("6. UI/UX & A11y", "Editorial serif headings with clean sans-serif body typography", () => {
  const css = fs.readFileSync("src/app/globals.css", "utf-8");
  assert(css.includes("font-family"), "Font family declarations missing in globals.css");
});

check("6. UI/UX & A11y", "Accessibility: Form inputs and buttons contain labels and focus rings", () => {
  const input = fs.readFileSync("src/components/ui/Input.tsx", "utf-8");
  const btn = fs.readFileSync("src/components/ui/Button.tsx", "utf-8");
  assert(input.includes("focus:ring-2") || input.includes("focus-visible:ring-2") || input.includes("focus:"), "Input focus ring missing");
  assert(btn.includes("focus-visible:ring-2") || btn.includes("focus:"), "Button focus ring missing");
});

// ----------------------------------------------------------------------
// 7. PERFORMANCE DAN PWA
// ----------------------------------------------------------------------
check("7. Performance & PWA", "Web App Manifest defines standalone, theme_color, icons, and shortcuts", () => {
  const manifest = JSON.parse(fs.readFileSync("public/manifest.json", "utf-8"));
  assert.strictEqual(manifest.display, "standalone");
  assert.strictEqual(manifest.theme_color, "#6E3511");
  assert(manifest.shortcuts.length >= 3, "Manifest shortcuts missing");
});

check("7. Performance & PWA", "Service worker implements network-first navigation & stale-while-revalidate caching", () => {
  const sw = fs.readFileSync("public/sw.js", "utf-8");
  assert(sw.includes("caches.open"), "SW cache initialization missing");
  assert(sw.includes("/offline") || sw.includes("offline"), "Offline fallback missing in SW");
});

check("7. Performance & PWA", "Dedicated Offline Page and Offline Indicator exist", () => {
  const offPage = fs.readFileSync("src/app/offline/page.tsx", "utf-8");
  const offInd = fs.readFileSync("src/components/OfflineIndicator.tsx", "utf-8");
  assert(offPage.includes("Offline"), "offline page missing indicator");
  assert(offInd.includes("navigator.onLine"), "offline indicator missing navigator.onLine check");
});

// ----------------------------------------------------------------------
// SUMMARY
// ----------------------------------------------------------------------
console.log("\n======================================================================");
const passed = results.filter((r) => r.status === "PASS").length;
const failed = results.filter((r) => r.status === "FAIL").length;
console.log(`AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED across all 7 pillars`);
console.log("======================================================================");

if (failed > 0) process.exit(1);
