"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockClosedIcon, CheckIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { changePasswordSchema } from "../utils/validation";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { FormField } from "@/components/ui/FormField";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Alert } from "@/components/ui/Alert";
import { z } from "zod";

export interface UserChangePasswordFormProps {
  isPending: boolean;
  onSubmit: (data: { password: string }) => void;
  onCancel: () => void;
  errorMessage: string;
  successMessage?: string;
}

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function UserChangePasswordForm({
  isPending,
  onSubmit,
  onCancel,
  errorMessage,
  successMessage,
}: UserChangePasswordFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword" }) || "";

  const onSubmitForm = (data: ChangePasswordFormData) => {
    onSubmit({ password: data.password });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden w-full max-w-xl mx-auto">
      {/* Card header */}
      <div className="px-6 sm:px-8 py-3.5 border-b border-gray-100 flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-orange-50 text-rms-gold p-0.5 shadow-sm flex-shrink-0 border border-orange-100/50">
          <div className="h-full w-full bg-white rounded-xl flex items-center justify-center">
            <LockClosedIcon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-rms-charcoal">Đổi mật khẩu người dùng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Thiết lập lại mật khẩu cho tài khoản này</p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-4 sm:py-5">
        <Alert type="success" message={successMessage || ""} />
        <Alert type="error" message={errorMessage} />

        <form onSubmit={handleSubmit(onSubmitForm)} noValidate className="rms-form">
          <div className="flex flex-col gap-y-6">
            <FormField
              label="Mật khẩu mới"
              id="change-password"
              required
              error={errors.password?.message}
            >
              <PasswordInput
                id="change-password"
                autoComplete="new-password"
                placeholder="Nhập mật khẩu mới"
                disabled={isPending}
                hasError={!!errors.password}
                {...register("password")}
              />
            </FormField>

            {/* Real-time Password Strength Meter */}
            {passwordValue.length > 0 && (
              <PasswordStrengthMeter password={passwordValue} className="px-1" />
            )}

            <FormField
              label="Xác nhận mật khẩu mới"
              id="change-confirm-password"
              required
              error={errors.confirmPassword?.message}
            >
              <PasswordInput
                id="change-confirm-password"
                autoComplete="new-password"
                placeholder="Xác nhận lại mật khẩu mới"
                disabled={isPending}
                hasError={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
            </FormField>

            {/* Match validation */}
            {(passwordValue.length > 0 || confirmPasswordValue.length > 0) && (
              <div className="mt-1 flex items-center gap-2 px-1">
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
          <div className="flex items-center justify-end gap-3 pt-3 mt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              title="Quay lại"
              aria-label="Quay lại"
              className="h-11 w-11 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:text-rms-burgundy hover:bg-gray-50 hover:border-rms-burgundy/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              <ArrowLeftIcon className="w-5 h-5" strokeWidth={2} />
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rms-submit-btn w-auto min-w-40 mt-0 !py-2.5 whitespace-nowrap"
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <IconSpinner />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Lưu mật khẩu</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
