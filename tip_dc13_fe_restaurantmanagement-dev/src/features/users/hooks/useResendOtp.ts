import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/services/api-client";

// Standard payload shape for all OTP resend endpoints.
// Both /api/users/create/resend and /api/users/me/email/resend accept this.
export interface OtpResendPayload {
  tempToken: string;
}

interface UseResendOtpOptions<TData> {
  /** The actual API function to call. Must accept OtpResendPayload and return a Promise. */
  mutationFn: (payload: OtpResendPayload) => Promise<TData>;
  /** Called after a successful resend. Receives the API response so callers can extract a new tempToken if needed. */
  onSuccess?: (data: TData) => void;
  /** Error message when the session is no longer valid (404). */
  notFoundMessage?: string;
  /** Fallback error message for other API errors. */
  genericErrorMessage?: string;
}

interface UseResendOtpReturn {
  resend: (tempToken: string) => void;
  isPending: boolean;
  errorMessage: string;
  clearError: () => void;
}

export function useResendOtp<TData>({
  mutationFn,
  onSuccess,
  notFoundMessage = "Phiên làm việc không còn hợp lệ. Vui lòng bắt đầu lại.",
  genericErrorMessage = "Không thể gửi lại mã. Vui lòng thử lại.",
}: UseResendOtpOptions<TData>): UseResendOtpReturn {
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useMutation({
    mutationFn,

    onSuccess: (data) => {
      setErrorMessage("");
      onSuccess?.(data);
    },

    onError: (err: Error) => {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setErrorMessage(notFoundMessage);
          return;
        }
        setErrorMessage(err.message || genericErrorMessage);
        return;
      }

      setErrorMessage("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
    },
  });

  return {
    resend: (tempToken: string) => mutation.mutate({ tempToken }),
    isPending: mutation.isPending,
    errorMessage,
    clearError: () => setErrorMessage(""),
  };
}
