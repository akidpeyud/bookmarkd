# BOOKMARKD — Authentication Regression Test Suite

## 1. Overview
This document specifies the regression scenarios executed to ensure that user identity cannot leak across sessions, that invalid credentials are appropriately rejected, and that user storage boundaries remain isolated.

All tests are implemented in executable scripts:
- `scripts/test-app.mjs`
- `scripts/test-multi-user-integration.mjs`
- `scripts/verify-all-7-pillars.mjs`
- `scripts/test-auth-session-and-logbook.mjs`

---

## 2. Test Cases & Execution Results

### Test Case 1: Strict Input Validation (Empty & Malformed Credentials)
* **Goal**: Verify that empty, incomplete, or malformed credentials are rejected before initiating backend requests or falling back to default personas.
* **Steps**:
  1. Call `authService.signIn("", "password123")` $\rightarrow$ Throws `"Email wajib diisi."`
  2. Call `authService.signIn("notanemail", "password123")` $\rightarrow$ Throws `"Format email tidak valid."`
  3. Call `authService.signIn("reader@test.com", "")` $\rightarrow$ Throws `"Password wajib diisi."`
  4. Call `authService.signIn("reader@test.com", "12345")` $\rightarrow$ Throws `"Password harus minimal 6 karakter."`
* **Result**: **PASS**

### Test Case 2: Unregistered Credential Rejection
* **Goal**: Ensure that entering an unregistered email never defaults to `dwiputra` or logs into a demo account.
* **Steps**:
  1. In offline/demo mode, call `authService.signIn("unknown_reader_xyz@domain.com", "password123")`.
  2. Verify error message: `"Akun tidak terdaftar. Periksa kembali email Anda..."`.
  3. Verify `authService.getSession()` returns `null` or remains unchanged.
* **Result**: **PASS**

### Test Case 3: Identity Swapping & Complete Session Purge on Sign Out
* **Goal**: Verify that logging out completely clears credentials, cookies, and local session objects.
* **Steps**:
  1. Authenticate as User A (`reader_a@test.com`).
  2. Verify active session key `bookmarkd_active_session` holds User A.
  3. Call `signOut()`.
  4. Verify:
     - `bookmarkd_active_session` is deleted.
     - `bookmarkd:session:<userA_id>` is deleted.
     - Cookie `bookmarkd_auth_session` is expired with `expires=Thu, 01 Jan 1970 00:00:00 GMT`.
     - `currentUser` in React store transitions to `GUEST_USER` (`id: 'guest-reader'`).
     - UI displays "Sign In" and "Create Account" buttons, not Dwiputra's name or avatar.
* **Result**: **PASS**

### Test Case 4: Storage Scoping & Cross-User Shelf Isolation
* **Goal**: Ensure User A cannot see User B's private books or reading logs on the same device.
* **Steps**:
  1. User A logs `The Secret History` as `Currently Reading` with progress of 150 pages.
  2. Verify saved key is `bookmarkd:user:<userA_id>:user_books`.
  3. Log out and authenticate as User B.
  4. User B queries their reading shelf via `libraryService.getUserBooks(userB.id)`.
  5. Verify returned array does NOT contain User A's book record.
* **Result**: **PASS**

### Test Case 5: Service Worker Cache Routing & BFCache Protection
* **Goal**: Ensure the Service Worker does not serve stale HTML of previously authenticated users.
* **Steps**:
  1. Verify `public/sw.js` defines `PRIVATE_ROUTES = ['/library', '/settings', '/notifications', '/profile', '/auth']`.
  2. Verify requests matching private routes bypass cache read/write.
  3. Verify navigation requests use network-first strategy with cache fallback strictly restricted to offline indicator page.
* **Result**: **PASS**

### Test Case 6: Cloud Profile Provisioning Trigger
* **Goal**: Verify migration SQL provisions profile row automatically via `auth.users` trigger.
* **Steps**:
  1. Verify `handle_new_user()` is attached as `AFTER INSERT` on `auth.users`.
  2. Verify function is declared `SECURITY DEFINER` with fixed `search_path`.
  3. Verify RLS policy restricts `profiles.insert` and `profiles.update` to `auth.uid() = id`.
* **Result**: **PASS**

---

## 3. Automation Summary
```
$ npm run test

=========================================
RESULTS: 8 PASSED, 0 FAILED (test-app.mjs)
MULTI-USER INTEGRATION RESULTS: 15 PASSED, 0 FAILED (test-multi-user-integration.mjs)
AUDIT SUMMARY: 25 PASSED, 0 FAILED (verify-all-7-pillars.mjs)
AUTH REGRESSION RESULTS: 5 PASSED, 0 FAILED (test-auth-session-and-logbook.mjs)
=========================================
Total: 53 Passed, 0 Failed.
```
