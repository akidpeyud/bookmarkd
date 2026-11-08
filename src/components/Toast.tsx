"use client";

import React from "react";
import { useBookmarkd } from "@/lib/store";
import { CheckCircle } from "lucide-react";

export function Toast() {
  const { toastMessage } = useBookmarkd();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-[#2C221A] text-[#FCECD8] rounded-xl shadow-xl border border-[#44362A] text-xs font-medium animate-bounce-subtle">
      <CheckCircle className="w-4 h-4 text-[#91AC67]" />
      <span>{toastMessage}</span>
    </div>
  );
}
