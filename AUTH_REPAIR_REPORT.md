# BOOKMARKD — Authentication & Session Identity Repair Report

## 1. Executive Summary
A critical identity persistence defect in **BOOKMARKD** was thoroughly diagnosed and resolved. Previously, the user account `"dwiputra"` remained displayed across the UI, storage layers, and active session even after user logout, registration of new accounts, or sign-in with differing credentials. Additionally, invalid and non-existent credentials previously produced silent mock sessions without raising appropriate authentication errors.

This repair delivers complete session isolation, strict credential verification, user-scoped storage, automated Supabase profile synchronization via database triggers, and a refreshed responsive sidebar with dedicated logged-out and authenticated states.

---

## 2. Root Cause Analysis (RCA)

A multi-layered investigation revealed five interdependent root causes:

### Root Cause 1: Static Synchronous State Initialization
* **Location**: `src/lib/store.tsx`
* **Mechanism**: `useState<UserProfile>(CURRENT_USER)` initialized the application state synchronously on mount to `CURRENT_USER` (hardcoded as `dwiputra`). Even when a user logged out, `signOut()` executed `setCurrentUser(CURRENT_USER)`, actively re-impersonating Dwiputra instead of reverting to an unauthenticated guest.

### Root Cause 2: Permissive Fallback in `authService.ts`
* **Location**: `src/lib/services/authService.ts`
* **Mechanism**: On sign-in failure or missing active session, `authService.getSession()` returned `CURRENT_USER` as default. In local demo mode, any unmatched email silently fell back to `CURRENT_USER` rather than rejecting invalid or unregistered credentials with an explicit error.

### Root Cause 3: Un-scoped Local Storage Keys
* **Location**: `src/lib/services/libraryService.ts`
* **Mechanism**: Library records were persisted under a single global key `bookmarkd_user_books`. When a new user registered or logged in, they inherited all existing books saved by the previous user in localStorage.

### Root Cause 4: Aggressive Service Worker HTML Navigation Caching
* **Location**: `public/sw.js`
* **Mechanism**: The PWA Service Worker (`bookmarkd-v2`) cached HTML navigation responses indiscriminately. When a user signed out and navigated to `/library`, `/profile`, or `/`, the service worker served stale pre-rendered HTML snapshots containing Dwiputra's name and avatar directly from the HTTP cache.

### Root Cause 5: Missing Cloud Auth Trigger & Profile Desynchronization
* **Location**: `supabase/schema.sql`
* **Mechanism**: Supabase Auth (`auth.users`) lacked an automated `AFTER INSERT` trigger on `auth.users` to provision rows in `public.profiles`. As a result, newly registered accounts via `supabase.auth.signUp()` had no corresponding profile row, causing the frontend to fall back to hardcoded demo data.

---

## 3. Implemented Architectural Repairs

### A. Strict Authentication Service (`src/lib/services/authService.ts`)
1. **Cloud Exclusivity**: When Supabase credentials are configured, `supabase.auth.signInWithPassword()` is the sole authority. Errors (e.g. wrong password, email not confirmed) are thrown immediately to the user interface.
2. **Input Validation**: Enforces non-empty, well-formatted email addresses (`^[^\s@]+@[^\s@]+\.[^\s@]+$`) and minimum 6-character passwords.
3. **Local Demo Mode Guard**: In offline/demo environments, passwords are strictly verified against `password123` for seed personas or against registered password hashes in `bookmarkd:local_registered_users`. Unknown emails throw `"Akun tidak terdaftar"`.
4. **Complete Session Purge on Sign Out**: `signOut()` revokes Supabase JWT sessions, removes `bookmarkd_active_session` and `bookmarkd:session:<id>` from localStorage, and sets cookie expiration to the Unix epoch.

### B. User-Scoped Local Storage (`src/lib/services/libraryService.ts`)
- All reading statuses and progress are isolated under:
  $$\text{Key} = \text{bookmarkd:user:}\langle\text{userId}\rangle\text{:user\_books}$$
- Different users on the same device or browser never cross-contaminate their library shelves, progress bars, or reading history.

### C. Context Store Refactoring (`src/lib/store.tsx`)
1. Initialized `currentUser` to `GUEST_USER` (`id: 'guest-reader'`).
2. Added `isAuthenticated: boolean` and `isAuthLoading: boolean` properties to `useBookmarkd()`.
3. Integrated `supabase.auth.onAuthStateChange()` to automatically synchronize authentication transitions (`SIGNED_IN`, `SIGNED_OUT`, `TOKEN_REFRESHED`).
4. On logout, resets active state to `GUEST_USER`, empties active user books, and prompts user feedback.

### D. Service Worker Zero-Cache Policy (`public/sw.js`)
- Bumped cache to `bookmarkd-v3`.
- Explicitly blocked caching on private, authenticated, and session routes:
  `['/library', '/settings', '/notifications', '/profile', '/auth']`.
- Network-first navigation prevents back-forward cache leakage of prior user data.

### E. Sidebar Navigation Redesign (`src/components/Navigation.tsx` & `MobileMenuDrawer.tsx`)
- **Logged Out State**: Displays a card with prominent **Sign In** (`#597928`) and **Create Account** outline buttons matching the palette.
- **Authenticated State**: Displays authenticated user avatar, display name, handle (`@username`), direct profile link, demo persona switcher, and red-accented **Log Out** button.

### F. Centralized Feedback Modal (`src/components/ui/NotificationModal.tsx`)
- Centered modal dialog replacing disjointed alerts.
- Adheres to color scheme `#6E3511`, `#91AC67`, `#597928`, and `#FCECD8`.

---

## 4. Verification & Validation Summary

| Test Phase | Verification Command | Result |
| :--- | :--- | :--- |
| **Unit & Integration Suite** | `node scripts/test-app.mjs` | **8/8 PASSED** |
| **Multi-User Social & RLS** | `node scripts/test-multi-user-integration.mjs` | **15/15 PASSED** |
| **Comprehensive 7 Pillars** | `node scripts/verify-all-7-pillars.mjs` | **25/25 PASSED** |
| **Auth & Isolation Regressions**| `node scripts/test-auth-session-and-logbook.mjs`| **5/5 PASSED** |
| **Code Style & ESLint** | `npm run lint` | **0 Errors, 0 Warnings** |
| **Production Build** | `npm run build` | **16/16 Pages Compiled** |

Identity persistence has been eliminated across all application boundaries.
