"use client";

import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#6E3511]"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#8C7D70] pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={`w-full text-xs sm:text-sm rounded-xl border border-[#D8C9B9] bg-white text-[#2C221A] transition-all focus:outline-hidden focus:border-[#6E3511] focus:ring-2 focus:ring-[#6E3511]/15 placeholder:text-[#9A8D80] disabled:bg-[#FAF5ED] disabled:opacity-60 ${
              leftIcon ? "pl-10" : "pl-3.5"
            } ${rightIcon ? "pr-10" : "pr-3.5"} py-2.5 ${
              error ? "border-rose-600 focus:border-rose-600 focus:ring-rose-200" : ""
            } ${className}`}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 text-[#8C7D70] shrink-0">
              {rightIcon}
            </div>
          )}
        </div>

        {hint && !error && <p className="text-[11px] text-[#8C7D70]">{hint}</p>}
        {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
