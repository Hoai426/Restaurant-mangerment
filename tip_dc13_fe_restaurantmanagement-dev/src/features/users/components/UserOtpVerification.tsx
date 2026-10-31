"use client";

import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import OtpVerificationForm from "./OtpVerificationForm";
import { useVerifyOtp } from "@/features/users/hooks/useVerifyOtp";
import { useResendOtp } from "@/features/users/hooks/useResendOtp";
import { userService } from "@/features/users/services/user.service";

export interface UserOtpVerificationProps {
  /** Email address to display as the OTP destination. */
  email: string;
  /** Session token from Step 1 (POST /api/users). */
  tempToken: string;
  /** Called after successful OTP verification — parent handles redirect. */
  onSuccess: () => void;
  /** Called when the user wants to go back to the form (Step 1). */
  onBack: () => void;
}

// Success overlay — shown briefly before the parent redirects

function SuccessOverlay() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden max-w-lg mx-auto">
      <div className="px-6 sm:px-8 py-8 flex flex-col items-center justify-center gap-4 animate-scale-in">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center animate-scale-in">
            <CheckCircleIcon
              className="rms-otp-success-icon"
              strokeWidth={1.5}
            />
          </div>
          <div className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-20" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-green-700">
            Kích hoạt tài khoản thành công!
          </p>
          <p className="text-sm text-gray-500 mt-1">Đang chuyển hướng...</p>
        </div>
      </div>
    </div>
  );
}

export default function UserOtpVerification({
  email,
  tempToken,
  onSuccess,
  onBack,
}: UserOtpVerificationProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const verify = useVerifyOtp({
    mutationFn: userService.verifyUserCreation.bind(userService),
    invalidateKeys: [["users"]],
    onSuccess: () => {
      setShowSuccess(true);
      // Brief delay so the success animation is visible before the parent redirects.
      window.setTimeout(() => onSuccess(), 1200);
    },
    onMaxAttempts: () => {
      onBack();
    },
    maxAttemptsMessage:
      "Đã vượt quá số lần thử tối đa. Vui lòng tạo lại tài khoản.",
    expiredMessage: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.",
    incorrectFallbackMessage: "Mã xác thực không đúng. Vui lòng thử lại.",
  });

  const resend = useResendOtp({
    mutationFn: userService.resendUserCreationOtp.bind(userService),
    notFoundMessage:
      "Phiên làm việc không còn hợp lệ. Vui lòng tạo lại tài khoản.",
  });

  if (showSuccess) {
    return <SuccessOverlay />;
  }

  return (
    <OtpVerificationForm
      email={email}
      inputIdPrefix="otp-digit"
      title="Nhập mã xác thực"
      submitLabel="Xác thực & Tạo tài khoản"
      submitLoadingLabel="Đang xác thực..."
      isVerifyPending={verify.isPending}
      verifyError={verify.errorMessage}
      onVerify={(otpCode) => verify.mutate({ tempToken, otpCode })}
      isResendPending={resend.isPending}
      resendError={resend.errorMessage}
      onResend={() => resend.resend(tempToken)}
      onBack={onBack}
      clearVerifyError={verify.clearError}
      clearResendError={resend.clearError}
    />
  );
}
