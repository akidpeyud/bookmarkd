"use client";

import React, { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating?: number; // 0.0 to 5.0
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

export function StarRating({
  rating = 0,
  onRatingChange,
  interactive = false,
  size = "md",
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    sm: "w-3.5 h-3.5",
    md: "w-4.5 h-4.5",
    lg: "w-6 h-6",
  }[size];

  const handleMouseMove = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    const value = isHalf ? index + 0.5 : index + 1.0;
    setHoverRating(value);
  };

  const handleClick = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!interactive || !onRatingChange) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const isHalf = e.clientX - rect.left < rect.width / 2;
    const value = isHalf ? index + 0.5 : index + 1.0;
    onRatingChange(value);
  };

  return (
    <div
      className="inline-flex items-center gap-1"
      onMouseLeave={() => interactive && setHoverRating(null)}
    >
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((index) => {
          const fillAmount = Math.max(0, Math.min(1, displayRating - index));

          return (
            <button
              type="button"
              key={index}
              disabled={!interactive}
              onMouseMove={(e) => handleMouseMove(index, e)}
              onClick={(e) => handleClick(index, e)}
              aria-label={interactive ? `Rate ${index + 1} of 5 stars` : `${displayRating.toFixed(1)} stars`}
              className={`relative p-0.5 transition-transform ${
                interactive ? "cursor-pointer hover:scale-110 focus:outline-hidden focus:ring-1 focus:ring-[#597928] rounded" : "cursor-default"
              }`}
              title={interactive ? `Rate ${(index + 1).toFixed(1)} stars` : undefined}
            >
              {/* Background empty star */}
              <Star
                className={`${sizeClasses} text-[#D8CEBF] transition-colors`}
                strokeWidth={1.5}
              />

              {/* Partial / Full colored overlay */}
              {fillAmount > 0 && (
                <div
                  className="absolute inset-0 overflow-hidden p-0.5 pointer-events-none"
                  style={{ width: `${fillAmount * 100}%` }}
                >
                  <Star
                    className={`${sizeClasses} text-[#597928] fill-[#597928]`}
                    strokeWidth={1.5}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1 text-xs font-semibold text-[#597928]">
          {displayRating > 0 ? displayRating.toFixed(1) : "—"}
        </span>
      )}
    </div>
  );
}
