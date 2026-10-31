"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  KeyIcon,
  LockClosedIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { FormField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Alert } from "@/components/ui/Alert";
import { changeMyPasswordSchema } from "../utils/validation";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { mapServerErrorsToForm } from "@/utils/form-errors";
import { ApiError } from "@/services/api-client";
import { z } from "zod";

export interface ProfileChangePasswordFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

type ChangeMyPasswordFormData = z.infer<typeof changeMyPasswordSchema>;

export default function ProfileChangePasswordForm({
  onSuccess,
  onCancel,
}: ProfileChangePasswordFormProps) {
  const [globalError, setGlobalError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangeMyPasswordFormData>({
    resolver: zodResolver(changeMyPasswordSchema),
    defaultValues: {
      currentPassword: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword" }) || "";

  const updateMutation = useUpdateProfile({
    onSuccess: () => {
      setGlobalError("");
      reset();
      onSuccess();
    },
    onError: (err: Error) => {
      if (err instanceof ApiError) {
        if (err.errorCode === "USER_CURRENT_PASSWORD_INCORRECT") {
          setError("currentPassword", {
            type: "server",
            message: err.message || "Mật khẩu hiện tại không đúng",
          });
          return;
        }

        if (err.status === 401) {
          setGlobalError("Phiên đăng nhập đã hết hạn hoặc không hợp lệ.");
          return;
        }

        mapServerErrorsToForm<ChangeMyPasswordFormData>(
          err,
          setError,
          setGlobalError,
          ["currentPassword", "password"]
        );
        return;
      }

      setGlobalError("Không thể kết nối đến máy chủ.");
    },
  });

  const isPending = updateMutation.isPending;

  const onSubmitForm = (data: ChangeMyPasswordFormData) => {
    setGlobalError("");
    updateMutation.mutate({
      currentPassword: data.currentPassword,
      password: data.password,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="px-6 sm:px-8 py-4 border-b border-gray-100 flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm flex-shrink-0">
          <div className="h-full w-full bg-white rounded-xl flex items-center justify-center text-rms-charcoal">
            <KeyIcon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-rms-charcoal">Đổi mật khẩu</h1>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-5">
        <Alert type="error" message={globalError} />

        <form onSubmit={handleSubmit(onSubmitForm)} noValidate className="rms-form">
          <div className="flex flex-col gap-y-5">
            {/* Current Password */}
            <FormField
              label="Mật khẩu hiện tại"
              id="change-my-current-password"
              required
              error={errors.currentPassword?.message}
              icon={<LockClosedIcon className="w-5 h-5 text-gray-400" strokeWidth={1.8} />}
            >
              <PasswordInput
                id="change-my-current-password"
                autoComplete="current-password"
                disabled={isPending}
                hasError={!!errors.currentPassword}
                className="pl-11"
                {...register("currentPassword")}
              />
            </FormField>

            {/* New Password */}
            <FormField
              label="Mật khẩu mới"
              id="change-my-new-password"
              required
              error={errors.password?.message}
              icon={<KeyIcon className="w-5 h-5 text-gray-400" strokeWidth={1.8} />}
            >
              <PasswordInput
                id="change-my-new-password"
                autoComplete="new-password"
                disabled={isPending}
                hasError={!!errors.password}
                className="pl-11"
                {...register("password")}
              />
            </FormField>

            {/* Real-time Password Strength Meter */}
            {passwordValue.length > 0 && (
              <PasswordStrengthMeter password={passwordValue} className="px-1" />
            )}

            {/* Confirm New Password */}
            <FormField
              label="Xác nhận mật khẩu mới"
              id="change-my-confirm-password"
              required
              error={errors.confirmPassword?.message}
              icon={<LockClosedIcon className="w-5 h-5 text-gray-400" strokeWidth={1.8} />}
            >
              <PasswordInput
                id="change-my-confirm-password"
                autoComplete="new-password"
                disabled={isPending}
                hasError={!!errors.confirmPassword}
                className="pl-11"
                {...register("confirmPassword")}
              />
            </FormField>

            {/* Real-time match validation */}
            {(passwordValue.length > 0 || confirmPasswordValue.length > 0) && (
              <div className="flex items-center gap-2 px-1">
                <CheckIcon
                  className={`w-4 h-4 shrink-0 transition-colors duration-300 ${
                    passwordValue === confirmPasswordValue && passwordValue.length > 0
                      ? "text-green-500"
                      : "text-gray-300"
                  }`}
                  strokeWidth={3}
                />
                <span
                  className={`text-xs transition-colors duration-300 ${
                    passwordValue === confirmPasswordValue && passwordValue.length > 0
                      ? "text-green-700 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  Mật khẩu khớp
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-5 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                reset();
                onCancel();
              }}
              disabled={isPending}
              title="Quay lại"
              aria-label="Quay lại"
              className="h-10 px-4 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:text-rms-burgundy hover:bg-gray-50 hover:border-rms-burgundy/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              <span className="font-medium text-sm">Quay lại</span>
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rms-submit-btn w-auto min-w-36 mt-0 !py-2.5 whitespace-nowrap"
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <IconSpinner />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Đổi mật khẩu</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
