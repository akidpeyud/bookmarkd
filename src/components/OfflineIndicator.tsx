"use client";

import React, { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return typeof navigator !== "undefined" ? !navigator.onLine : false;
}

function getServerSnapshot() {
  return false;
}

export function OfflineIndicator() {
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#6E3511] text-[#FCECD8] text-[11px] font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-md animate-fadeIn">
      <WifiOff className="w-3.5 h-3.5 text-[#91AC67]" />
      <span>Offline mode active &bull; Reading logs and saved books remain cached locally</span>
    </div>
  );
}
