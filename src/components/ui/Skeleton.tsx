"use client";

import React from "react";

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[#EADECE]/60 ${className}`}
      {...props}
    />
  );
}

export function BookCardSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="w-full h-52 sm:h-64 rounded-md" />
      <Skeleton className="w-3/4 h-3.5" />
      <Skeleton className="w-1/2 h-3" />
    </div>
  );
}
