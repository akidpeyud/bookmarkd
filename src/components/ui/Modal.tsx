"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "md",
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[maxWidth];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidthClasses} max-h-[90vh] overflow-y-auto bg-[#FAF5ED] rounded-2xl shadow-2xl border border-[#E4D5C3] p-6 text-[#2C221A]`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || subtitle) && (
          <div className="flex items-start justify-between border-b border-[#E8DDCE] pb-4 mb-5">
            <div>
              {subtitle && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#597928] block">
                  {subtitle}
                </span>
              )}
              {title && (
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C221A] leading-tight">
                  {title}
                </h3>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#EFE5D7] text-[#7A6F65] hover:text-[#2C221A] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
