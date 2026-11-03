"use client";

import React, { createContext, useContext, useState, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

const emptySubscribe = () => () => {};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  const toast = React.useMemo(
    () => ({
      success: (msg: string) => addToast("success", msg),
      error: (msg: string) => addToast("error", msg),
      info: (msg: string) => addToast("info", msg),
      warning: (msg: string) => addToast("warning", msg),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {isMounted &&
        createPortal(
          <div
            aria-live="polite"
            aria-atomic="true"
            className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full"
          >
            {toasts.map((t) => {
              const bgClass =
                t.type === "success"
                  ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                  : t.type === "error"
                  ? "bg-rose-50 text-rose-900 border-rose-200"
                  : t.type === "warning"
                  ? "bg-amber-50 text-amber-900 border-amber-200"
                  : "bg-blue-50 text-blue-900 border-blue-200";

              const Icon =
                t.type === "success"
                  ? CheckCircleIcon
                  : t.type === "error"
                  ? ExclamationCircleIcon
                  : InformationCircleIcon;

              const iconColor =
                t.type === "success"
                  ? "text-emerald-600"
                  : t.type === "error"
                  ? "text-rose-600"
                  : t.type === "warning"
                  ? "text-amber-600"
                  : "text-blue-600";

              return (
                <div
                  key={t.id}
                  role="status"
                  className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-xs transition-all animate-fade-in ${bgClass}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
                  <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
                    {t.message}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeToast(t.id)}
                    className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer text-gray-500 hover:text-gray-700"
                    aria-label="Đóng thông báo"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
