import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/services/api-client";

// Known OTP-related error codes returned by the backend.
type OtpErrorCode =
  | "AUTH_OTP_INCORRECT"
  | "AUTH_OTP_EXPIRED"
  | "AUTH_OTP_MAX_ATTEMPTS";

function isOtpErrorCode(code: string | undefined): code is OtpErrorCode {
  return (
    code === "AUTH_OTP_INCORRECT" ||
    code === "AUTH_OTP_EXPIRED" ||
    code === "AUTH_OTP_MAX_ATTEMPTS"
  );
}

// Standard payload shape for all OTP verify endpoints.
// Both /api/users/create/verify and /api/users/me/email/verify accept this.
export interface OtpVerifyPayload {
  tempToken: string;
  otpCode: string;
}

interface UseVerifyOtpOptions<TData> {
  /** The actual API function to call. Must accept OtpVerifyPayload and return a Promise. */
  mutationFn: (payload: OtpVerifyPayload) => Promise<TData>;
  /** Called after the backend confirms the OTP and any cache invalidation completes. */
  onSuccess: () => void;
  /** Called when the backend returns AUTH_OTP_MAX_ATTEMPTS. Caller handles navigation. */
  onMaxAttempts?: () => void;
  /** React Query keys to invalidate on success. Defaults to none. */
  invalidateKeys?: unknown[][];
  /** Error message for AUTH_OTP_MAX_ATTEMPTS. */
  maxAttemptsMessage?: string;
  /** Error message for AUTH_OTP_EXPIRED. */
  expiredMessage?: string;
  /** Fallback message for AUTH_OTP_INCORRECT when the backend provides no message. */
  incorrectFallbackMessage?: string;
  /** Fallback for generic API errors. */
  genericErrorMessage?: string;
}

interface UseVerifyOtpReturn {
  mutate: (payload: OtpVerifyPayload) => void;
  isPending: boolean;
  errorCode: OtpErrorCode | null;
  errorMessage: string;
  clearError: () => void;
}

export function useVerifyOtp<TData>({
  mutationFn,
  onSuccess,
  onMaxAttempts,
  invalidateKeys = [],
  maxAttemptsMessage = "Đã vượt quá số lần tạo tối đa. Vui lòng thử lại.",
  expiredMessage = "OTP đã hết hạn. Vui lòng yêu cầu mã mới",
  incorrectFallbackMessage = "Mã xác thực không đúng. Vui lòng thử lại",
  genericErrorMessage = "Xác thực thất bại. Vui lòng thử lại",
}: UseVerifyOtpOptions<TData>): UseVerifyOtpReturn {
  const queryClient = useQueryClient();
  const [errorCode, setErrorCode] = useState<OtpErrorCode | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useMutation({
    mutationFn,

    onSuccess: async () => {
      // Invalidate all provided cache keys before notifying the caller.
      await Promise.all(
        invalidateKeys.map((key) =>
          queryClient.invalidateQueries({ queryKey: key })
        )
      );
      onSuccess();
    },

    onError: (err: Error) => {
      if (err instanceof ApiError) {
        const code = err.errorCode;

        if (isOtpErrorCode(code)) {
          setErrorCode(code);

          if (code === "AUTH_OTP_MAX_ATTEMPTS") {
            setErrorMessage(maxAttemptsMessage);
            onMaxAttempts?.();
            return;
          }

          if (code === "AUTH_OTP_EXPIRED") {
            setErrorMessage(expiredMessage);
            return;
          }

          // AUTH_OTP_INCORRECT — backend message may include remaining attempt count.
          setErrorMessage(err.message || incorrectFallbackMessage);
          return;
        }

        setErrorMessage(err.message || genericErrorMessage);
        return;
      }

      setErrorMessage("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.");
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    errorCode,
    errorMessage,
    clearError: () => {
      setErrorCode(null);
      setErrorMessage("");
    },
  };
}
