"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBookmarkd } from "@/lib/store";

export default function CurrentUserProfilePage() {
  const router = useRouter();
  const { currentUser } = useBookmarkd();

  useEffect(() => {
    if (currentUser?.username) {
      router.replace(`/profile/${currentUser.username}`);
    }
  }, [currentUser, router]);

  return (
    <div className="p-8 text-center text-xs text-[#7A6F65]">
      Loading your profile...
    </div>
  );
}
