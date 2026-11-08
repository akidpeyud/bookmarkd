import React from "react";
import Link from "next/link";
import { Bookmark, Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white border border-[#E7DCCE] shadow-xl space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#FAF5ED] border border-[#E8DDCE] flex items-center justify-center text-[#6E3511] mx-auto shadow-2xs">
          <Bookmark className="w-7 h-7 fill-[#6E3511]" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-[#597928] block">
          Error 404 — Volume Not Found
        </span>

        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A]">
          Lost Between the Pages
        </h1>

        <p className="text-xs sm:text-sm text-[#7A6F65] leading-relaxed">
          The manuscript, reading shelf, or book edition you are seeking does not exist or may have been placed in another archive.
        </p>

        <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6E3511] hover:bg-[#592B0E] text-[#FCECD8] text-xs font-bold shadow-md transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>

          <Link
            href="/discover"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF5ED] hover:bg-[#F2E8DC] border border-[#D8C9B9] text-[#4A3E35] text-xs font-semibold transition-all"
          >
            <Compass className="w-4 h-4 text-[#597928]" />
            <span>Browse Discover</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
