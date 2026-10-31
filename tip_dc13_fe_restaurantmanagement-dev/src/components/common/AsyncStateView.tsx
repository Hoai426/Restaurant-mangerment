import React from "react";
import { IconSpinner } from "@/components/common/IconSpinner";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export interface AsyncStateViewProps {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry?: () => void;
  loadingMessage?: string;
  children: React.ReactNode;
}

export function AsyncStateView({
  isLoading,
  isError,
  error,
  onRetry,
  loadingMessage = "Đang tải dữ liệu...",
  children,
}: AsyncStateViewProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-gray-400">
        <IconSpinner />
        <p className="mt-4 text-sm font-medium">{loadingMessage}</p>
      </div>
    );
  }

  if (isError) {
    const errInfo = getApiErrorMessage(error);
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-3">
          <ExclamationTriangleIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-rms-charcoal">
          {errInfo.title}
        </h3>
        {errInfo.message && (
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {errInfo.message}
          </p>
        )}
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors bg-rms-gradient cursor-pointer shadow-sm hover:opacity-95"
          >
            Thử lại
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
}

export default AsyncStateView;
