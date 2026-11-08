# BOOKMARKD 📚
> **The Social Reading Platform for Book Lovers**  
> Inspired by Letterboxd — designed specifically for readers.

---

## 📖 Vision & Design Identity

**Bookmarkd** is a community-driven reading journal and social platform where bibliophiles can track books, write reviews, rate with half-star precision, craft curated reading lists, follow fellow readers, set annual reading challenges, and share their literary journeys.

### Color Palette
- **Primary Brown**: `#6E3511`
- **Sage Green**: `#91AC67`
- **Forest Green**: `#597928`
- **Warm Cream**: `#FCECD8`

### Typography & Aesthetics
- **Headings**: Elegant serif typography (`Lora` / Playfair editorial style)
- **Body**: Clean, high-legibility sans-serif typography (`Plus Jakarta Sans`)
- **Aesthetic**: Warm vintage bookstore, modern editorial, generous whitespace, tactile 3D book spine shadows, half-star green ratings, and clean minimalist card hierarchy.

---

## 🚀 Key Features

### 1. Authentication & Profiles
- Email / password sign-up and sign-in flow.
- One-click demo personas (Dwi Putra, Clara Vance, Julian Sterling, Elena Rostova) for testing.
- Profile customization: avatar, bio, location, website, handle, and **Letterboxd-style Favorite Four Books**.

### 2. Discover & Global Book Search
- **Live Google Books API & Open Library API Integration**: Search millions of real books by title, author, genre, or ISBN with high-resolution covers, publication years, page counts, and publishers.
- Filter by genre (*Dark Academia, Classics, Literary Fiction, Sci-Fi, Fantasy, Japanese Literature*), rating threshold, and publication era.

### 3. My Books & Library Management
- Four reading statuses:
  - **Want to Read**
  - **Currently Reading**
  - **Read**
  - **DNF (Did Not Finish)**
- **Grid and List layouts**: Switch between high-cover grid mode and rich list view with start/finish dates, reading progress bars, and personal ratings.
- Page count and percentage progress slider.

### 4. Book Details & Rating Histogram
- Comprehensive edition metadata: ISBN, Publisher, Year, Page Count, Genres, and expandable synopsis.
- **Letterboxd-style Rating Histogram**: Community rating distribution from 0.5 to 5.0 stars.
- Interactive half-star rating tool (0.5 increments).
- One-click "Add to Library", "Log/Review", and "Add to Reading List".
- Activity feed of community members who also read the book.

### 5. Ratings & Written Reviews
- Half-star rating system (0.5 to 5.0).
- Spoiler warning toggle with blur/reveal protective shield.
- Review likes, comments, deletion, and editing.
- Distinguishes personal rating from global community score.

### 6. Curated Reading Lists
- Create custom public or private lists with title, curator statement, and custom book collections.
- Visual cover stacking preview.
- Like and save lists curated by other readers.

### 7. Annual Reading Challenge
- Set annual goal (e.g., 30 books in 2026).
- Progress bar, milestone badges (25%, 50%, 100%), and schedule pacing indicator (*"2 books ahead of schedule"*).
- Interactive celebration with confetti animation.

### 8. Reading Statistics & Analytics
- Total books read, total pages read, average rating, and reading streaks.
- **Monthly reading velocity bar chart**.
- Most-read genres breakdown with visual distribution bars.
- Favorite authors showcase.

### 9. Social & Community Feed
- Global community activity vs. "Following Only" filtered feed.
- Member spotlights with follow/unfollow capability.
- Real-time notification drawer (likes, comments, new followers, goal milestones).

### 10. Progressive Web App (PWA)
- Installable PWA support with `manifest.json` and service worker caching (`/sw.js`).
- Mobile-first responsive navigation: Bottom navigation bar on mobile + collapsible sidebar on desktop.
- Touch-friendly controls, zero horizontal scroll, and fast loading.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, custom CSS variables, `@tailwindcss/postcss`
- **Icons**: Lucide React
- **Celebration**: Canvas Confetti
- **APIs**: Google Books API, Open Library API
- **Database & Auth**: PostgreSQL schema with Row Level Security (RLS) policies (`supabase/schema.sql`), ready for Supabase or local-first persistent state fallback.

---

## 🗄 PostgreSQL & Supabase Database Architecture

The schema in `supabase/schema.sql` includes:
- `profiles`
- `books`
- `user_books`
- `reviews`
- `review_likes`
- `review_comments`
- `follows`
- `reading_lists`
- `reading_list_books`
- `reading_challenges`
- `notifications`
- Complete Row Level Security (RLS) policies ensuring users only modify authorized resources.

---

## 🔐 Akun & Kredensial Pengujian (Demo / Test Accounts)

Platform BOOKMARKD dilengkapi dengan akun pengguna siap pakai untuk pengujian fitur autentikasi, isolasi sesi, dan interaksi sosial:

| Nama Pengguna | Username | Email Login | Password Demo | Peran / Aktivitas Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Dwi Putra** | `dwiputra` | `dwiputra@test.com` | `password123` | **Akun Utama:** Reading Challenge 30 buku, ulasan Donna Tartt, statistik lengkap |
| **Alice Montgomery** | `reader_a` | `reader_a@test.com` | `password123` | **Test User A:** Kurator reading list publik & privat, ulasan *The Secret History* |
| **Bob Hawthorne** | `reader_b` | `reader_b@test.com` | `password123` | **Test User B:** Interaksi sosial, pemberi like & komentar, pengikut User A |
| **Clara Vance** | `clara_reads` | `clara@test.com` | `password123` | **Persona Komunitas:** Scholar sastra komparatif, kurator *Dark Academia* |
| **Julian Sterling** | `julian_pages` | `julian@test.com` | `password123` | **Persona Komunitas:** Reviewer sci-fi & esai filosofis |
| **Elena Rostova** | `elena_books` | `elena@test.com` | `password123` | **Persona Komunitas:** Pembaca sastra kontemporer Asia & indie poetry |

> 💡 **Tips Pengujian Login & Logout:**
> - **Login:** Kunjungi `/auth` atau klik menu **Sign In / Switch** di sidebar. Anda dapat mengetikkan email & password di atas, atau klik salah satu kartu persona pada panel *"Instant Demo Reader Personas"* untuk masuk dengan 1 klik.
> - **Logout:** Klik kartu profil pengguna di bagian bawah sidebar (atau menu Settings / Drawer Mobile), lalu klik tombol merah **Log Out**.
> - **Registrasi Baru:** Pada halaman `/auth`, klik tab **Sign Up** untuk membuat akun baru dengan email kustom.

---

## 🏁 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional for Cloud Supabase)
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your credentials if connecting to Supabase cloud:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```
*(If omitted, Bookmarkd automatically activates its full local-first persistent demo store so every single feature works immediately!)*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm run start
```
