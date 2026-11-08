"use client";

import React from "react";
import { BookOpen } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`p-10 sm:p-14 text-center rounded-2xl bg-white border border-[#E7DCCE] shadow-xs flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FAF5ED] border border-[#E8DDCE] flex items-center justify-center text-[#6E3511] mb-1">
        {icon || <BookOpen className="w-7 h-7 text-[#8C7D70]" />}
      </div>
      <h3 className="font-serif text-lg font-bold text-[#2C221A]">{title}</h3>
      <p className="text-xs sm:text-sm text-[#7A6F65] max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button onClick={onAction} variant="primary" size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
