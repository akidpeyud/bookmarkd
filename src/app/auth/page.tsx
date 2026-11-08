"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useBookmarkd } from "@/lib/store";
import { Bookmark, Lock, Mail, User, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AuthPage() {
  const router = useRouter();
  const { switchUser, communityUsers, signIn, signUp } = useBookmarkd();

  const [mode, setMode] = useState<"login" | "signup">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("mode") === "signup" ? "signup" : "login";
    }
    return "login";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "signup") {
        if (!fullName.trim() || !username.trim()) {
          setErrorMessage("Please enter your full name and username.");
          setIsLoading(false);
          return;
        }
        await signUp(fullName.trim(), username.trim(), email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
      router.push("/");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed. Please try again.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSignIn = (userId: string) => {
    switchUser(userId);
    router.push("/");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E7DCCE] shadow-xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-[#6E3511] text-[#FCECD8] flex items-center justify-center mx-auto shadow-sm">
            <Bookmark className="w-6 h-6 fill-[#FCECD8]" />
          </div>
          <h1 className="font-serif text-2xl font-black text-[#6E3511] tracking-tight">
            BOOKMARKD
          </h1>
          <p className="text-xs text-[#7A6F65]">
            The Social Reading Platform for Book Lovers
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#E8DDCE] text-xs font-semibold">
          <button
            onClick={() => {
              setMode("login");
              setErrorMessage("");
            }}
            className={`flex-1 pb-2.5 border-b-2 transition-colors cursor-pointer ${
              mode === "login"
                ? "border-[#6E3511] text-[#6E3511]"
                : "border-transparent text-[#7A6F65]"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setErrorMessage("");
            }}
            className={`flex-1 pb-2.5 border-b-2 transition-colors cursor-pointer ${
              mode === "signup"
                ? "border-[#6E3511] text-[#6E3511]"
                : "border-transparent text-[#7A6F65]"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Error Notice */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <Input
                label="Full Name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Donna Tartt"
                leftIcon={<User className="w-4 h-4" />}
              />

              <Input
                label="Username (@handle)"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="literary_scholar"
                leftIcon={<span className="text-xs font-bold">@</span>}
              />
            </>
          )}

          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="reader@bookmarkd.app"
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock className="w-4 h-4" />}
            hint="Minimum 6 characters"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {mode === "login" ? "Sign In to Bookmarkd" : "Join Bookmarkd Community"}
          </Button>
        </form>

        {/* One-Click Demo Personas */}
        <div className="pt-4 border-t border-[#F2E9DE] space-y-2.5">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#597928]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Reader Personas</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {communityUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleQuickDemoSignIn(u.id)}
                className="p-2 rounded-xl bg-[#FAF5ED] border border-[#E7DCCE] hover:border-[#6E3511] text-left transition-colors flex items-center gap-2 cursor-pointer group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={u.avatar_url}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover border border-[#D5C6B5]"
                />
                <div className="overflow-hidden">
                  <span className="block text-[11px] font-bold text-[#2C221A] truncate group-hover:text-[#6E3511]">
                    {u.full_name}
                  </span>
                  <span className="block text-[9px] text-[#8C7D70] truncate">
                    @{u.username}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
