import { supabase, isSupabaseConfigured } from "../supabase";
import { UserProfile } from "@/types";
import { CURRENT_USER, COMMUNITY_USERS } from "../mockData";

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "bookmarkd_active_session";

export const authService = {
  // Get active session
  getSession(): UserProfile {
    if (typeof window === "undefined") return CURRENT_USER;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not retrieve session from storage", e);
    }
    return CURRENT_USER;
  },

  // Save active session
  saveSession(profile: UserProfile): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn("Could not save session to storage", e);
    }
  },

  // Sign up
  async signUp(
    fullName: string,
    username: string,
    email: string,
    password?: string
  ): Promise<UserProfile> {
    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      username: username.toLowerCase().replace(/[^a-z0-9_]/g, ""),
      full_name: fullName,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
      bio: "New reader on Bookmarkd. Logging thoughts and favorite literary gems.",
      favorite_book_ids: ["secret-history", "piranesi"],
      reading_goal_annual: 25,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              username,
            },
          },
        });
        if (error) {
          console.warn("Supabase auth signUp error, falling back to local session:", error.message);
        } else if (data.user) {
          newProfile.id = data.user.id;
          // upsert profile row
          await supabase.from("profiles").upsert({
            id: data.user.id,
            username: newProfile.username,
            full_name: newProfile.full_name,
            avatar_url: newProfile.avatar_url,
            bio: newProfile.bio,
            reading_goal_annual: 25,
          });
        }
      } catch (err) {
        console.warn("Supabase request failed:", err);
      }
    }

    this.saveSession(newProfile);
    return newProfile;
  },

  // Sign in
  async signIn(email: string, password?: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase && password) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data.user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (profileData) {
            const profile: UserProfile = {
              id: profileData.id,
              username: profileData.username,
              full_name: profileData.full_name,
              avatar_url: profileData.avatar_url,
              bio: profileData.bio,
              location: profileData.location,
              website: profileData.website,
              favorite_book_ids: profileData.favorite_book_ids || [],
              reading_goal_annual: profileData.reading_goal_annual || 25,
              created_at: profileData.created_at,
            };
            this.saveSession(profile);
            return profile;
          }
        }
      } catch (err) {
        console.warn("Supabase signIn error:", err);
      }
    }

    // Fallback: match persona or create user
    const matched = COMMUNITY_USERS.find(
      (u) => u.username.toLowerCase() === email.split("@")[0].toLowerCase()
    );
    const profile = matched || CURRENT_USER;
    this.saveSession(profile);
    return profile;
  },

  // Sign out
  async signOut(): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut error:", err);
      }
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  },
};
