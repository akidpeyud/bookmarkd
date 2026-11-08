export type ReadingStatus = 'want_to_read' | 'currently_reading' | 'read' | 'dnf';

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url: string;
  isbn?: string;
  publisher?: string;
  published_year?: number;
  page_count?: number;
  genres: string[];
  avg_rating: number;
  ratings_count: number;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  email?: string;
  avatar_url: string;
  bio?: string;
  website?: string;
  location?: string;
  favorite_book_ids: string[];
  reading_goal_annual: number;
  created_at: string;
}

export interface UserBook {
  id: string;
  user_id: string;
  book_id: string;
  status: ReadingStatus;
  rating?: number; // 0.5 to 5.0
  progress_pages: number;
  start_date?: string;
  finish_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  book?: Book;
}

export interface Review {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  content: string;
  contains_spoilers: boolean;
  likes_count: number;
  created_at: string;
  updated_at?: string;
  user?: UserProfile;
  book?: Book;
  liked_by_me?: boolean;
  comments_count?: number;
}

export interface ReviewComment {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: UserProfile;
}

export interface ReadingList {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_private: boolean;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: UserProfile;
  book_ids: string[];
  books?: Book[];
  liked_by_me?: boolean;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  actor_id: string;
  actor?: UserProfile;
  type: 'follow' | 'like_review' | 'comment_review' | 'list_like' | 'goal_reached';
  message: string;
  entity_id?: string;
  read: boolean;
  created_at: string;
}

export interface ActivityFeedItem {
  id: string;
  user_id: string;
  user: UserProfile;
  type: 'read' | 'started_reading' | 'rated' | 'reviewed' | 'added_to_list';
  book: Book;
  rating?: number;
  review?: Review;
  list_title?: string;
  created_at: string;
  likes_count: number;
  liked_by_me?: boolean;
}
