import { supabase, isSupabaseConfigured } from "../supabase";
import { UserProfile } from "@/types";
import { COMMUNITY_USERS } from "../mockData";

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isCloud: boolean;
}

const STORAGE_ACTIVE_SESSION = "bookmarkd_active_session";
const COOKIE_NAME = "bookmarkd_auth_session";
const STORAGE_REGISTERED_LOCAL_USERS = "bookmarkd:local_registered_users";

export interface LocalRegisteredAccount {
  user: UserProfile;
  passwordHash: string;
}

export const authService = {
  // Check if real cloud Supabase instance is configured
  isCloudConfigured(): boolean {
    return isSupabaseConfigured && Boolean(supabase);
  },

  // Helper: email regex validation
  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  },

  // Get active session
  getSession(): UserProfile | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVE_SESSION);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Could not retrieve session from storage", e);
    }
    return null;
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return Boolean(this.getSession());
  },

  // Save active session with user-scoped storage and secure cookie
  saveSession(profile: UserProfile): void {
    if (typeof window === "undefined") return;
    try {
      // 1. User-scoped storage
      localStorage.setItem(`bookmarkd:session:${profile.id}`, JSON.stringify(profile));
      // 2. Active session pointer
      localStorage.setItem(STORAGE_ACTIVE_SESSION, JSON.stringify(profile));
      // 3. Cookie for Edge Middleware
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
        profile.id
      )}; path=/; max-age=604800; SameSite=Lax`;
    } catch (e) {
      console.warn("Could not save session to storage", e);
    }
  },

  // Get locally registered accounts (for Local Demo mode)
  getLocalRegisteredAccounts(): LocalRegisteredAccount[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_REGISTERED_LOCAL_USERS);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  },

  // Save new local registered account
  saveLocalRegisteredAccount(account: LocalRegisteredAccount): void {
    if (typeof window === "undefined") return;
    const existing = this.getLocalRegisteredAccounts();
    const updated = [account, ...existing.filter((a) => a.user.id !== account.user.id)];
    localStorage.setItem(STORAGE_REGISTERED_LOCAL_USERS, JSON.stringify(updated));
  },

  // Sign in: Strict credential validation without fake sessions or dwiputra fallbacks
  async signIn(email: string, password?: string): Promise<UserProfile> {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    // 1. Strict form validation
    if (!cleanEmail) {
      throw new Error("Email wajib diisi.");
    }
    if (!this.validateEmail(cleanEmail)) {
      throw new Error("Format email tidak valid. Masukkan alamat email yang benar.");
    }
    if (!cleanPassword) {
      throw new Error("Password wajib diisi.");
    }
    if (cleanPassword.length < 6) {
      throw new Error("Password harus minimal 6 karakter.");
    }

    // 2. Cloud Authentication via Supabase
    if (this.isCloudConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        // Strict: Never fallback to local mock users when Supabase is configured
        if (error.message.includes("Invalid login credentials") || error.status === 400) {
          throw new Error("Email atau password salah. Silakan periksa kembali kredensial Anda.");
        }
        if (error.message.includes("Email not confirmed")) {
          throw new Error("Email Anda belum dikonfirmasi. Silakan periksa inbox email Anda.");
        }
        throw new Error(`Login Supabase gagal: ${error.message}`);
      }

      if (!data.user) {
        throw new Error("Sesi login tidak valid dari server autentikasi.");
      }

      // Fetch profile using authenticated UUID (auth.uid())
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      let profile: UserProfile;

      if (!profileError && profileData) {
        profile = {
          id: profileData.id,
          username: profileData.username,
          full_name: profileData.full_name,
          email: data.user.email || profileData.email || cleanEmail,
          avatar_url: profileData.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileData.username}`,
          bio: profileData.bio || "Passionate reader on Bookmarkd.",
          location: profileData.location,
          website: profileData.website,
          favorite_book_ids: profileData.favorite_book_ids || [],
          reading_goal_annual: profileData.reading_goal_annual || 25,
          created_at: profileData.created_at,
        };
      } else {
        // Fallback upsert if profile row was delayed
        const derivedUsername =
          data.user.user_metadata?.username ||
          cleanEmail.split("@")[0].replace(/[^a-z0-9_]/g, "") ||
          `reader_${data.user.id.slice(0, 6)}`;
        const derivedName =
          data.user.user_metadata?.full_name || cleanEmail.split("@")[0];

        profile = {
          id: data.user.id,
          username: derivedUsername,
          full_name: derivedName,
          email: data.user.email || cleanEmail,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${derivedUsername}`,
          bio: "Passionate reader on Bookmarkd.",
          favorite_book_ids: [],
          reading_goal_annual: 25,
          created_at: new Date().toISOString(),
        };

        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: derivedUsername,
          full_name: derivedName,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          reading_goal_annual: 25,
        });
      }

      this.saveSession(profile);
      return profile;
    }

    // 3. Local Demo Mode (When Supabase is not configured)
    // Check known demo reader accounts
    const demoUser = COMMUNITY_USERS.find(
      (u) => u.email && u.email.toLowerCase() === cleanEmail
    );

    if (demoUser) {
      // Demo accounts use fixed password 'password123'
      if (cleanPassword !== "password123") {
        throw new Error("Password salah untuk akun demo ini. (Password demo: password123)");
      }
      this.saveSession(demoUser);
      return demoUser;
    }

    // Check locally registered accounts
    const localAccounts = this.getLocalRegisteredAccounts();
    const matchedLocal = localAccounts.find(
      (a) => a.user.email && a.user.email.toLowerCase() === cleanEmail
    );

    if (matchedLocal) {
      if (matchedLocal.passwordHash !== cleanPassword) {
        throw new Error("Password salah. Silakan coba lagi.");
      }
      this.saveSession(matchedLocal.user);
      return matchedLocal.user;
    }

    // Unregistered account -> REJECT!
    throw new Error(
      "Akun tidak terdaftar. Periksa kembali email Anda atau klik 'Daftar' untuk membuat akun baru."
    );
  },

  // Sign up
  async signUp(
    fullName: string,
    username: string,
    email: string,
    password?: string
  ): Promise<UserProfile> {
    const cleanFullName = (fullName || "").trim();
    const cleanUsername = (username || "").toLowerCase().replace(/[^a-z0-9_]/g, "").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    if (!cleanFullName || cleanFullName.length < 2) {
      throw new Error("Nama lengkap harus diisi (minimal 2 karakter).");
    }
    if (!cleanUsername || cleanUsername.length < 3) {
      throw new Error("Username harus minimal 3 karakter (huruf, angka, atau underscore).");
    }
    if (!cleanEmail || !this.validateEmail(cleanEmail)) {
      throw new Error("Format email tidak valid. Masukkan alamat email yang benar.");
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      throw new Error("Password harus minimal 6 karakter.");
    }

    // Cloud Registration via Supabase
    if (this.isCloudConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          data: {
            full_name: cleanFullName,
            username: cleanUsername,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("unique")) {
          throw new Error("Email ini sudah terdaftar. Silakan login.");
        }
        throw new Error(`Pendaftaran gagal: ${error.message}`);
      }

      if (!data.user) {
        throw new Error("Pendaftaran gagal: Server autentikasi tidak mengembalikan data user.");
      }

      const newProfile: UserProfile = {
        id: data.user.id,
        username: cleanUsername,
        full_name: cleanFullName,
        email: cleanEmail,
        avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`,
        bio: "New reader on Bookmarkd. Logging thoughts and favorite literary gems.",
        favorite_book_ids: [],
        reading_goal_annual: 25,
        created_at: new Date().toISOString(),
      };

      // Upsert profile row (handled by database trigger or fallback upsert)
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          username: newProfile.username,
          full_name: newProfile.full_name,
          avatar_url: newProfile.avatar_url,
          bio: newProfile.bio,
          reading_goal_annual: 25,
        });
      } catch (err) {
        console.warn("Profile trigger/upsert notice:", err);
      }

      this.saveSession(newProfile);
      return newProfile;
    }

    // Local Demo Registration
    const isTakenDemo = COMMUNITY_USERS.some(
      (u) =>
        u.username.toLowerCase() === cleanUsername ||
        (u.email && u.email.toLowerCase() === cleanEmail)
    );
    const localAccounts = this.getLocalRegisteredAccounts();
    const isTakenLocal = localAccounts.some(
      (a) =>
        a.user.username.toLowerCase() === cleanUsername ||
        (a.user.email && a.user.email.toLowerCase() === cleanEmail)
    );

    if (isTakenDemo || isTakenLocal) {
      throw new Error("Username atau email sudah digunakan. Pilih username lain.");
    }

    const newProfile: UserProfile = {
      id: `usr-${Date.now()}`,
      username: cleanUsername,
      full_name: cleanFullName,
      email: cleanEmail,
      avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${cleanUsername}`,
      bio: "New reader on Bookmarkd. Logging thoughts and favorite literary gems.",
      favorite_book_ids: [],
      reading_goal_annual: 25,
      created_at: new Date().toISOString(),
    };

    this.saveLocalRegisteredAccount({
      user: newProfile,
      passwordHash: cleanPassword,
    });

    this.saveSession(newProfile);
    return newProfile;
  },

  // Sign out: Completely invalidate session, clear cookies and storage
  async signOut(): Promise<void> {
    if (this.isCloudConfigured() && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("Supabase signOut error:", err);
      }
    }
    if (typeof window !== "undefined") {
      const active = this.getSession();
      if (active?.id) {
        localStorage.removeItem(`bookmarkd:session:${active.id}`);
      }
      localStorage.removeItem(STORAGE_ACTIVE_SESSION);
      document.cookie = `${COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
    }
  },
};
