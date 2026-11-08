"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { BookCard } from "@/components/BookCard";
import confetti from "canvas-confetti";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import {
  Trophy,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Edit2,
  BookOpen,
  Flame,
  Gift,
  Check,
} from "lucide-react";

export default function ChallengePage() {
  const {
    currentUser,
    userBooks,
    books,
    setAnnualGoal,
    openLogModal,
    showToast,
  } = useBookmarkd();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(currentUser.reading_goal_annual || 30);
  const [streakLoggedToday, setStreakLoggedToday] = useState(false);
  const [streakDays, setStreakDays] = useState(18);

  const readUserBooks = userBooks.filter(
    (ub) => ub.user_id === currentUser.id && ub.status === "read"
  );
  const readBooks = readUserBooks
    .map((ub) => books.find((b) => b.id === ub.book_id))
    .filter(Boolean) as any[];

  const currentYear = new Date().getFullYear();
  const goal = currentUser.reading_goal_annual || 30;
  const count = readBooks.length;
  const percent = Math.min(100, Math.round((count / goal) * 100));

  // Pacing
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const expectedPace = (goal / 365) * dayOfYear;
  const diff = count - Math.round(expectedPace);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goalInput > 0) {
      setAnnualGoal(goalInput);
      setIsEditingGoal(false);
    }
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: ["#6E3511", "#91AC67", "#597928", "#FCECD8"],
    });
  };

  const handleLogStreak = () => {
    if (!streakLoggedToday) {
      setStreakDays((prev) => prev + 1);
      setStreakLoggedToday(true);
      triggerCelebration();
      showToast("🔥 Daily reading streak logged! Keep up the literary habit.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Page Header */}
      <PageHeader
        kicker="Annual Literary Milestone"
        title={`${currentYear} Reading Challenge`}
        description="Turn pages into milestones. Cultivate your reading habit throughout the year."
        action={
          <div className="flex items-center gap-2">
            <Link href="/wrapped">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Gift className="w-4 h-4 text-[#6E3511]" />}
              >
                2026 Wrapped
              </Button>
            </Link>
            <Button
              onClick={triggerCelebration}
              variant="forest"
              size="sm"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              Celebrate
            </Button>
          </div>
        }
      />

      {/* Hero Progress Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white to-[#FAF5ED] border border-[#E7DCCE] shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#6E3511] flex items-center justify-center text-[#FCECD8] shadow-sm shrink-0">
              <Trophy className="w-7 h-7 text-[#FCECD8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-3xl font-black text-[#2C221A]">
                  {count} <span className="text-lg font-normal text-[#7A6F65]">/ {goal}</span>
                </span>
                <button
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="p-1 text-[#8C7D70] hover:text-[#6E3511] cursor-pointer"
                  title="Edit annual goal"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-[#7A6F65]">books completed in {currentYear}</p>
            </div>
          </div>

          {/* Pacing Badge */}
          <div className="p-3 rounded-2xl bg-[#EFF4E7] border border-[#D5E4C8] text-xs font-semibold text-[#597928] flex items-center gap-2 self-start sm:self-auto">
            <TrendingUp className="w-4 h-4" />
            <span>
              {diff >= 0
                ? `${diff === 0 ? "Right on track" : `${diff} book${diff > 1 ? "s" : ""} ahead of schedule`}!`
                : `${Math.abs(diff)} book${Math.abs(diff) > 1 ? "s" : ""} behind pace`}
            </span>
          </div>
        </div>

        {/* Goal Edit Form */}
        {isEditingGoal && (
          <form
            onSubmit={handleGoalSubmit}
            className="p-3 rounded-xl bg-white border border-[#D8C9B9] flex items-center gap-3 animate-fadeIn"
          >
            <span className="text-xs font-medium text-[#4A3E35]">Change 2026 Target:</span>
            <input
              type="number"
              min="1"
              max="365"
              value={goalInput}
              onChange={(e) => setGoalInput(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 text-xs border rounded-lg bg-[#FAF5ED]"
            />
            <Button type="submit" variant="primary" size="xs">
              Update Goal
            </Button>
          </form>
        )}

        {/* Big Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#6E3511]">
            <span>Reading Goal Completion</span>
            <span className="font-serif text-sm text-[#597928]">{percent}%</span>
          </div>
          <div className="w-full h-4 rounded-full bg-[#EFE8DF] overflow-hidden p-0.5 border border-[#DECFBE]">
            <div
              className="h-full bg-gradient-to-r from-[#91AC67] to-[#597928] rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          {[
            { milestone: "First Book Read", achieved: count >= 1 },
            { milestone: "Quarter Century (25%)", achieved: percent >= 25 },
            { milestone: "Halfway There (50%)", achieved: percent >= 50 },
            { milestone: "Goal Achieved (100%)", achieved: percent >= 100 },
          ].map((m, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                m.achieved
                  ? "bg-[#EFF4E7] border-[#CDE1BE] text-[#597928] font-semibold"
                  : "bg-white/60 border-[#E8DDCE] text-[#A29486]"
              }`}
            >
              <CheckCircle2 className={`w-4 h-4 ${m.achieved ? "text-[#597928]" : "text-[#D5C6B5]"}`} />
              <span className="text-[11px]">{m.milestone}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Streak & Daily Check-in Card */}
      <div className="p-6 rounded-3xl bg-white border border-[#E7DCCE] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-black text-[#2C221A]">
                {streakDays} Days
              </span>
              <span className="text-xs text-[#597928] font-semibold">Active Streak</span>
            </div>
            <p className="text-xs text-[#7A6F65]">
              You have read at least 15 minutes each day for {streakDays} consecutive days.
            </p>
          </div>
        </div>

        <Button
          onClick={handleLogStreak}
          disabled={streakLoggedToday}
          variant={streakLoggedToday ? "forest" : "primary"}
          size="sm"
          leftIcon={streakLoggedToday ? <Check className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
        >
          {streakLoggedToday ? "Today's Reading Logged" : "Log Today's Session"}
        </Button>
      </div>

      {/* Completed Books Shelf */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8DDCE] pb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#6E3511]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C221A]">
              Books Finished for Challenge ({readBooks.length})
            </h2>
          </div>

          <button
            onClick={() => openLogModal()}
            className="text-xs font-semibold text-[#6E3511] hover:underline cursor-pointer"
          >
            + Log Another Finished Book
          </button>
        </div>

        {readBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {readBooks.map((book) => (
              <BookCard key={book.id} book={book} size="md" />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl bg-white border border-[#E7DCCE] space-y-2">
            <BookOpen className="w-8 h-8 text-[#A29486] mx-auto" />
            <p className="text-xs text-[#7A6F65]">
              No finished books logged for this year yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
