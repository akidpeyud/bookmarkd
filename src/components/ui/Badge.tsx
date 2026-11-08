"use client";

import React from "react";

export type BadgeVariant = "default" | "forest" | "sage" | "outline" | "reading" | "dnf" | "cream";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export function Badge({
  children,
  variant = "default",
  size = "md",
  icon,
  className = "",
  ...props
}: BadgeProps) {
  const base = "inline-flex items-center font-medium rounded-full transition-colors select-none";

  const variants: Record<BadgeVariant, string> = {
    default: "bg-[#FCECD8] text-[#6E3511] font-semibold border border-[#F3DEBE]",
    forest: "bg-[#597928] text-white font-semibold",
    sage: "bg-[#91AC67] text-white font-semibold",
    outline: "bg-white text-[#786C60] border border-[#E8DDCE]",
    reading: "bg-[#EFF4E7] text-[#597928] font-semibold border border-[#D5E4C8]",
    dnf: "bg-[#EFE8DF] text-[#7A6F65] font-semibold",
    cream: "bg-[#FAF5ED] text-[#4A3E35] border border-[#E8DDCE]",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
  };

  return (
    <span className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
