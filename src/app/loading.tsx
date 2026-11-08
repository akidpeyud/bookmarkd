"use client";

import React from "react";
import { BookOpen } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-[#6E3511] flex items-center justify-center text-[#FCECD8] shadow-md animate-bounce">
          <BookOpen className="w-7 h-7" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-serif text-base font-bold text-[#2C221A]">
          Opening your reading journal...
        </p>
        <p className="text-xs text-[#7A6F65]">
          Preparing literary collections and reader reviews
        </p>
      </div>
    </div>
  );
}
