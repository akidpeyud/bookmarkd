"use client";

import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "primary" | "forest" | "sage" | "outline" | "ghost" | "danger";
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl cursor-pointer select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6E3511] focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

    const variantStyles: Record<ButtonVariant, string> = {
      primary: "bg-[#6E3511] hover:bg-[#5A2B0E] text-[#FCECD8] shadow-sm hover:shadow-md",
      forest: "bg-[#597928] hover:bg-[#435E1C] text-white shadow-sm hover:shadow-md",
      sage: "bg-[#91AC67] hover:bg-[#748F4C] text-white shadow-sm hover:shadow-md",
      outline:
        "bg-white hover:bg-[#FAF5ED] text-[#4A3E35] border border-[#D8C9B9] hover:border-[#6E3511]",
      ghost: "bg-transparent hover:bg-[#FAF5ED] text-[#4A3E35] hover:text-[#6E3511]",
      danger: "bg-rose-700 hover:bg-rose-800 text-white shadow-sm",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      xs: "text-[11px] px-2.5 py-1 gap-1 rounded-lg",
      sm: "text-xs px-3.5 py-1.5 gap-1.5 rounded-lg",
      md: "text-xs sm:text-sm px-4 py-2.5 gap-2",
      lg: "text-sm sm:text-base px-6 py-3 gap-2.5 rounded-2xl",
      icon: "p-2 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
