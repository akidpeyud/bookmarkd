"use client";

import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export function Card({
  children,
  hoverEffect = false,
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white border border-[#E7DCCE] shadow-xs ${
        hoverEffect ? "hover:shadow-md hover:border-[#D5C4B0] transition-all duration-200" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-5 sm:p-6 border-b border-[#F2E9DE] flex items-center justify-between gap-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`p-4 sm:p-6 pt-0 border-t border-[#F2E9DE] mt-4 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
