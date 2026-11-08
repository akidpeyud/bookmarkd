"use client";

import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(() =>
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#6E3511] text-[#FCECD8] text-[11px] font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-md animate-fadeIn">
      <WifiOff className="w-3.5 h-3.5 text-[#91AC67]" />
      <span>Offline mode active &bull; Reading logs and saved books remain cached locally</span>
    </div>
  );
}
