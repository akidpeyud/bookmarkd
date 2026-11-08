"use client";

import React from "react";

export interface PageHeaderProps {
  kicker?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  kicker,
  title,
  description,
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DDCE] pb-5 ${className}`}
    >
      <div>
        {kicker && (
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#597928] block mb-0.5">
            {kicker}
          </span>
        )}
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2C221A] leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-[#7A6F65] mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {action && <div className="self-start sm:self-auto shrink-0">{action}</div>}
    </div>
  );
}
