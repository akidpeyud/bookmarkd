import { Book } from "@/types";

interface GoogleBooksItem {
  id?: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    publisher?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    industryIdentifiers?: Array<{ identifier: string }>;
  };
}

interface OpenLibraryDoc {
  key?: string;
  title?: string;
  author_name?: string[];
  first_sentence?: string[];
  cover_i?: number;
  isbn?: string[];
  publisher?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

export async function searchBooksApi(query: string): Promise<Book[]> {
  if (!query || query.trim().length === 0) return [];

  const cleanQuery = encodeURIComponent(query.trim());

  // Attempt Google Books API first
  try {
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${cleanQuery}&maxResults=15&printType=books`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.items && Array.isArray(data.items) && data.items.length > 0) {
        return (data.items as GoogleBooksItem[]).map((item) => {
          const info = item.volumeInfo || {};
          const imageLinks = info.imageLinks || {};
          let cover = imageLinks.thumbnail || imageLinks.smallThumbnail || "";

          // Fix google books image urls to use https and clean resolution
          if (cover.startsWith("http://")) {
            cover = cover.replace("http://", "https://");
          }
          if (cover.includes("&edge=curl")) {
            cover = cover.replace("&edge=curl", "");
          }
          if (!cover) {
            cover = `https://covers.openlibrary.org/b/isbn/${
              info.industryIdentifiers?.[0]?.identifier || "placeholder"
            }-M.jpg`;
          }

          let pubYear: number | undefined;
          if (info.publishedDate) {
            const parsed = parseInt(info.publishedDate.slice(0, 4));
            if (!isNaN(parsed)) pubYear = parsed;
          }

          return {
            id: item.id || `gb-${Math.random().toString(36).substring(2, 9)}`,
            title: info.title || "Untitled Book",
            author:
              info.authors && info.authors.length > 0
                ? info.authors.join(", ")
                : "Unknown Author",
            description:
              info.description || "No description available for this edition.",
            cover_url: cover,
            isbn: info.industryIdentifiers?.[0]?.identifier || undefined,
            publisher: info.publisher || "Various Publishers",
            published_year: pubYear || new Date().getFullYear(),
            page_count: info.pageCount || 300,
            genres:
              info.categories && info.categories.length > 0
                ? info.categories.slice(0, 3)
                : ["Fiction"],
            avg_rating: info.averageRating || 4.2,
            ratings_count:
              info.ratingsCount || Math.floor(Math.random() * 500 + 50),
          };
        });
      }
    }
  } catch (err) {
    console.warn("Google Books API error, trying Open Library fallback:", err);
  }

  // Open Library API fallback
  try {
    const olRes = await fetch(
      `https://openlibrary.org/search.json?q=${cleanQuery}&limit=12`
    );
    if (olRes.ok) {
      const olData = await olRes.json();
      if (olData.docs && Array.isArray(olData.docs) && olData.docs.length > 0) {
        return (olData.docs as OpenLibraryDoc[]).map((doc) => {
          const coverId = doc.cover_i;
          const coverUrl = coverId
            ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
            : "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80";

          return {
            id: doc.key
              ? doc.key.replace("/works/", "")
              : `ol-${Math.random().toString(36).substring(2, 9)}`,
            title: doc.title || "Untitled",
            author: doc.author_name
              ? doc.author_name.slice(0, 2).join(", ")
              : "Unknown Author",
            description: doc.first_sentence
              ? doc.first_sentence[0]
              : "A classic work preserved in the literary catalog.",
            cover_url: coverUrl,
            isbn: doc.isbn ? doc.isbn[0] : undefined,
            publisher: doc.publisher ? doc.publisher[0] : "Independent",
            published_year: doc.first_publish_year || 2020,
            page_count: doc.number_of_pages_median || 280,
            genres: doc.subject ? doc.subject.slice(0, 3) : ["Literature"],
            avg_rating: 4.1,
            ratings_count: 120,
          };
        });
      }
    }
  } catch (olErr) {
    console.error("Open Library search error:", olErr);
  }

  return [];
}
