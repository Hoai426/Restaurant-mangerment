"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import OtpVerificationForm from "./OtpVerificationForm";
import { useVerifyOtp } from "@/features/users/hooks/useVerifyOtp";
import { useResendOtp } from "@/features/users/hooks/useResendOtp";
import { userService } from "@/features/users/services/user.service";
import type { ResendEmailChangeOtpResponse } from "@/types/user";

export interface ProfileEmailOtpVerificationProps {
  /** New email address to display as the OTP destination. */
  email: string;
  /** Session token for email-change OTP. */
  tempToken: string;
  /** Called after successful OTP verification. */
  onSuccess: () => void;
  /** Called when the user wants to cancel and return to the edit form. */
  onBack: () => void;
}

export default function ProfileEmailOtpVerification({
  email,
  tempToken: initialTempToken,
  onSuccess,
  onBack,
}: ProfileEmailOtpVerificationProps) {
  // The resend endpoint may return a refreshed tempToken; keep it in local state.
  const [currentTempToken, setCurrentTempToken] = useState(initialTempToken);
  const [showSuccess, setShowSuccess] = useState(false);

  const verify = useVerifyOtp({
    mutationFn: userService.verifyEmailChange.bind(userService),
    // Invalidate both the profile query and the full users list.
    invalidateKeys: [["users", "me"], ["users"]],
    onSuccess: () => {
      setShowSuccess(true);
      window.setTimeout(() => onSuccess(), 1000);
    },
    onMaxAttempts: () => {
      onBack();
    },
    maxAttemptsMessage:
      "Đã vượt quá số lần thử tối đa. Vui lòng thử lại.",
    expiredMessage: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.",
    incorrectFallbackMessage: "Mã xác thực không đúng. Vui lòng thử lại.",
  });

  const resend = useResendOtp<ResendEmailChangeOtpResponse>({
    mutationFn: userService.resendEmailChangeOtp.bind(userService),
    onSuccess: (res) => {
      // Backend may issue a refreshed token on resend.
      if (res?.tempToken) {
        setCurrentTempToken(res.tempToken);
      }
    },
    notFoundMessage:
      "Phiên làm việc không còn hợp lệ. Vui lòng bắt đầu lại.",
  });

  if (showSuccess) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-lg mx-auto animate-fade-in-up">
        <div className="px-6 sm:px-8 py-8 flex flex-col items-center justify-center gap-4 animate-scale-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
              <CheckCircleIcon
                className="w-10 h-10 text-green-600"
                strokeWidth={1.5}
              />
            </div>
            <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-20" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-green-700">
              Xác thực email thành công!
            </p>
            <p className="text-sm text-gray-500 mt-1">Đang hoàn tất...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OtpVerificationForm
      email={email}
      inputIdPrefix="profile-otp-digit"
      title="Xác thực Email mới"
      subtitle="Nhập mã xác thực để cập nhật email"
      submitLabel="Xác thực & Lưu"
      submitLoadingLabel="Đang xác thực..."
      isVerifyPending={verify.isPending}
      verifyError={verify.errorMessage}
      onVerify={(otpCode) =>
        verify.mutate({ tempToken: currentTempToken, otpCode })
      }
      isResendPending={resend.isPending}
      resendError={resend.errorMessage}
      onResend={() => resend.resend(currentTempToken)}
      onBack={onBack}
      clearVerifyError={verify.clearError}
      clearResendError={resend.clearError}
    />
  );
}
