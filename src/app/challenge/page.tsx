"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBookmarkd } from "@/lib/store";
import { BookCard } from "@/components/BookCard";
import confetti from "canvas-confetti";
import {
  Trophy,
  Target,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Edit2,
  BookOpen,
} from "lucide-react";

export default function ChallengePage() {
  const {
    currentUser,
    userBooks,
    books,
    setAnnualGoal,
    openLogModal,
  } = useBookmarkd();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(currentUser.reading_goal_annual || 30);

  // Books read by user
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

  // Pacing calculation: e.g. Day of year vs ratio
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
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6E3511", "#91AC67", "#597928", "#FCECD8"],
    });
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 md:py-8 space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDCE] pb-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928]">
            Annual Journey
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A]">
            {currentYear} Reading Challenge
          </h1>
          <p className="text-xs text-[#7A6F65] mt-0.5">
            Turn pages into milestones. Cultivate your reading habit throughout the year.
          </p>
        </div>

        <button
          onClick={triggerCelebration}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EFF4E7] text-[#597928] border border-[#CCDDC1] hover:bg-[#E2EDD6] text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Celebrate Progress</span>
        </button>
      </div>

      {/* Hero Progress Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white to-[#FAF5ED] border border-[#E7DCCE] shadow-md space-y-6">
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
          <div className="p-3 rounded-xl bg-[#EFF4E7] border border-[#D5E4C8] text-xs font-semibold text-[#597928] flex items-center gap-2 self-start sm:self-auto">
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
            className="p-3 rounded-lg bg-white border border-[#D8C9B9] flex items-center gap-3 animate-fadeIn"
          >
            <span className="text-xs font-medium text-[#4A3E35]">Change 2026 Target:</span>
            <input
              type="number"
              min="1"
              max="365"
              value={goalInput}
              onChange={(e) => setGoalInput(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 text-xs border rounded bg-[#FAF5ED]"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-[#6E3511] text-[#FCECD8] rounded text-xs font-semibold"
            >
              Update Goal
            </button>
          </form>
        )}

        {/* Big Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-[#6E3511]">
            <span>Reading Journey Completion</span>
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
            className="text-xs font-semibold text-[#6E3511] hover:underline"
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
          <div className="p-8 text-center rounded-xl bg-white border border-[#E7DCCE] space-y-2">
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
