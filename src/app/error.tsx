"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Bookmarkd encountered an error:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md p-8 rounded-2xl bg-white border border-[#E7DCCE] shadow-xl space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h2 className="font-serif text-xl font-bold text-[#2C221A]">
          A page in our archive slipped
        </h2>

        <p className="text-xs text-[#7A6F65] leading-relaxed">
          We encountered an unexpected issue while retrieving this literary collection.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#6E3511] text-[#FCECD8] text-xs font-semibold hover:bg-[#592B0E] transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-[#D8C9B9] bg-white text-[#4A3E35] text-xs font-semibold hover:border-[#6E3511] transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
