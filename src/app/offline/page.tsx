"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, BookOpen, RefreshCw, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-white border border-[#E7DCCE] shadow-xl space-y-4 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-[#EFF4E7] border border-[#CCDDC1] flex items-center justify-center text-[#597928] mx-auto shadow-2xs">
          <WifiOff className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-[#597928] block">
          Offline Mode Active
        </span>

        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A]">
          Reading Without Distractions
        </h1>

        <p className="text-xs sm:text-sm text-[#7A6F65] leading-relaxed">
          You are currently reading offline. Your library, saved books, and journal logs remain cached locally on your device.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/library" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Bookmark className="w-4 h-4" />}
            >
              Open My Offline Library
            </Button>
          </Link>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Reconnect
          </Button>
        </div>
      </div>
    </div>
  );
}
