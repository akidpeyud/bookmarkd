"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  HelpCircle,
  X,
} from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info" | "confirm";

export interface NotificationOptions {
  title?: string;
  message: string;
  type?: NotificationType;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  autoClose?: boolean;
  duration?: number;
}

interface NotificationContextType {
  notify: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    confirm: (options: {
      message: string;
      title?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => void;
  };
  closeNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [activeNotification, setActiveNotification] = useState<NotificationOptions | null>(null);

  const closeNotification = useCallback(() => {
    setActiveNotification(null);
  }, []);

  const showNotification = useCallback((options: NotificationOptions) => {
    setActiveNotification(options);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeNotification) {
        if (activeNotification.type === "confirm" && activeNotification.onCancel) {
          activeNotification.onCancel();
        }
        closeNotification();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeNotification, closeNotification]);

  // Handle auto-dismiss for non-confirm, non-error notifications
  useEffect(() => {
    if (!activeNotification) return;

    if (activeNotification.type === "success" || activeNotification.autoClose) {
      const timer = setTimeout(() => {
        closeNotification();
      }, activeNotification.duration || 3500);
      return () => clearTimeout(timer);
    }
  }, [activeNotification, closeNotification]);

  const notify = {
    success: (message: string, title: string = "Operation Successful") => {
      showNotification({ message, title, type: "success" });
    },
    error: (message: string, title: string = "Attention Required") => {
      showNotification({ message, title, type: "error" });
    },
    warning: (message: string, title: string = "Notice") => {
      showNotification({ message, title, type: "warning" });
    },
    info: (message: string, title: string = "Information") => {
      showNotification({ message, title, type: "info" });
    },
    confirm: (options: {
      message: string;
      title?: string;
      confirmLabel?: string;
      cancelLabel?: string;
      onConfirm: () => void;
      onCancel?: () => void;
    }) => {
      showNotification({
        message: options.message,
        title: options.title || "Confirm Action",
        type: "confirm",
        confirmLabel: options.confirmLabel || "Confirm",
        cancelLabel: options.cancelLabel || "Cancel",
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
      });
    },
  };

  const getIcon = (type?: NotificationType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-7 h-7 text-[#597928]" />;
      case "error":
        return <XCircle className="w-7 h-7 text-rose-700" />;
      case "warning":
        return <AlertTriangle className="w-7 h-7 text-amber-700" />;
      case "info":
        return <Info className="w-7 h-7 text-[#6E3511]" />;
      case "confirm":
        return <HelpCircle className="w-7 h-7 text-[#6E3511]" />;
      default:
        return <Info className="w-7 h-7 text-[#6E3511]" />;
    }
  };

  const getBorderColor = (type?: NotificationType) => {
    switch (type) {
      case "success":
        return "border-[#91AC67]";
      case "error":
        return "border-rose-300";
      case "warning":
        return "border-amber-300";
      default:
        return "border-[#E4D5C3]";
    }
  };

  return (
    <NotificationContext.Provider value={{ notify, closeNotification }}>
      {children}

      {/* Centered Modal Overlay */}
      {activeNotification && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
          onClick={() => {
            if (activeNotification.type !== "confirm") {
              closeNotification();
            }
          }}
        >
          <div
            className={`relative w-full max-w-md bg-[#FCECD8] rounded-2xl shadow-2xl border-2 ${getBorderColor(
              activeNotification.type
            )} p-6 sm:p-7 text-[#2C221A] flex flex-col space-y-4 animate-scaleUp`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/80 border border-[#E4D5C3] flex items-center justify-center shadow-xs shrink-0">
                  {getIcon(activeNotification.type)}
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#6E3511] leading-tight">
                    {activeNotification.title}
                  </h3>
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-[#91AC67]">
                    Bookmarkd Reader Alert
                  </span>
                </div>
              </div>
              <button
                onClick={closeNotification}
                className="p-1.5 rounded-full hover:bg-black/5 text-[#7A6F65] hover:text-[#2C221A] transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Body */}
            <div className="text-xs sm:text-sm text-[#4E433A] leading-relaxed pl-1">
              {activeNotification.message}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8DDCE]">
              {activeNotification.type === "confirm" ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeNotification.onCancel) activeNotification.onCancel();
                      closeNotification();
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-[#D5C6B5] hover:bg-[#FAF5ED] text-[#5C5045] transition-colors cursor-pointer"
                  >
                    {activeNotification.cancelLabel || "Cancel"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (activeNotification.onConfirm) activeNotification.onConfirm();
                      closeNotification();
                    }}
                    className="px-5 py-2 text-xs font-bold rounded-xl bg-[#597928] hover:bg-[#48631F] text-white shadow-sm transition-all cursor-pointer"
                  >
                    {activeNotification.confirmLabel || "Confirm"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={closeNotification}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#6E3511] hover:bg-[#592B0E] text-[#FCECD8] shadow-sm transition-all cursor-pointer"
                >
                  Understood
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}
