import { Book } from "@/types";
import { INITIAL_BOOKS } from "../mockData";
import { supabase, isSupabaseConfigured } from "../supabase";
import { searchBooksApi } from "../booksApi";

const STORAGE_KEY = "bookmarkd_books";

export const booksService = {
  // Get all locally cached / seed books
  getAllBooks(): Book[] {
    if (typeof window === "undefined") return INITIAL_BOOKS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Storage read error", e);
    }
    return INITIAL_BOOKS;
  },

  // Save books catalog
  saveBooks(books: Book[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch (e) {
      console.warn("Storage write error", e);
    }
  },

  // Search books across API + Local
  async searchBooks(query: string, localBooks: Book[]): Promise<Book[]> {
    if (!query || query.trim().length === 0) return localBooks;

    const clean = query.trim().toLowerCase();

    // 1. Local matches
    const localMatches = localBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(clean) ||
        b.author.toLowerCase().includes(clean) ||
        (b.isbn && b.isbn.includes(clean)) ||
        b.genres.some((g) => g.toLowerCase().includes(clean))
    );

    // 2. If query is long enough, search real external APIs
    if (clean.length >= 3) {
      try {
        const apiResults = await searchBooksApi(clean);
        const combined = [...localMatches];

        apiResults.forEach((ab) => {
          if (!combined.some((b) => b.id === ab.id || (b.isbn && b.isbn === ab.isbn))) {
            combined.push(ab);
          }
        });

        return combined;
      } catch (err) {
        console.warn("Search API fallback to local:", err);
      }
    }

    return localMatches;
  },

  // Get single book by ID with fallback lookup
  async getBookById(id: string, localBooks: Book[]): Promise<Book | undefined> {
    const found = localBooks.find((b) => b.id === id);
    if (found) return found;

    // Try Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from("books").select("*").eq("id", id).single();
        if (data) {
          const book: Book = {
            id: data.id,
            title: data.title,
            author: data.author,
            description: data.description,
            cover_url: data.cover_url,
            isbn: data.isbn,
            publisher: data.publisher,
            published_year: data.published_year,
            page_count: data.page_count,
            genres: data.genres || [],
            avg_rating: Number(data.avg_rating) || 4.0,
            ratings_count: data.ratings_count || 10,
          };
          return book;
        }
      } catch (e) {
        console.warn("Supabase book fetch failed:", e);
      }
    }

    // Try Google Books API lookup by id
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
      if (res.ok) {
        const item = await res.json();
        const info = item.volumeInfo || {};
        const imageLinks = info.imageLinks || {};
        let cover = imageLinks.thumbnail || imageLinks.smallThumbnail || "";
        if (cover.startsWith("http://")) cover = cover.replace("http://", "https://");

        const book: Book = {
          id: item.id,
          title: info.title || "Untitled Book",
          author: info.authors ? info.authors.join(", ") : "Unknown Author",
          description: info.description || "No description provided.",
          cover_url:
            cover ||
            "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
          isbn: info.industryIdentifiers?.[0]?.identifier,
          publisher: info.publisher,
          published_year: info.publishedDate ? parseInt(info.publishedDate.slice(0, 4)) : 2020,
          page_count: info.pageCount || 300,
          genres: info.categories ? info.categories.slice(0, 3) : ["Literature"],
          avg_rating: info.averageRating || 4.2,
          ratings_count: info.ratingsCount || 100,
        };
        return book;
      }
    } catch (e) {
      console.warn("External API book fetch failed:", e);
    }

    return undefined;
  },

  // Save book to cloud database if configured
  async syncBookToCloud(book: Book): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("books").upsert({
          id: book.id,
          title: book.title,
          author: book.author,
          description: book.description,
          cover_url: book.cover_url,
          isbn: book.isbn,
          publisher: book.publisher,
          published_year: book.published_year,
          page_count: book.page_count,
          genres: book.genres,
          avg_rating: book.avg_rating,
          ratings_count: book.ratings_count,
        });
      } catch (err) {
        console.warn("Book cloud sync skipped:", err);
      }
    }
  },
};
