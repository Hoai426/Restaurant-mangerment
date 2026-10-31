"use client";

import { useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  LockClosedIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import type { CreateUserRequest } from "@/types/user";
import { userCreateSchema } from "../utils/validation";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { ROLE_SELECT_OPTIONS, STATUS_OPTIONS } from "@/constants/user.constants";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface UserCreateFormProps {
  initialData?: CreateUserRequest;
  serverFieldErrors: FieldErrors<CreateUserRequest>;
  errorMessage: string;
  isPending: boolean;
  onSubmit: (data: CreateUserRequest) => void;
  onCancel: () => void;
}

type UserCreateFormData = z.infer<typeof userCreateSchema>;

export default function UserCreateForm({
  initialData,
  serverFieldErrors,
  errorMessage,
  isPending,
  onSubmit,
  onCancel,
}: UserCreateFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<UserCreateFormData>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      username: initialData?.username || "",
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      password: initialData?.password || "",
      role: initialData?.role || "STAFF",
      isActive: initialData?.isActive ?? true,
    },
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";

  // Destructure register for username to filter invalid characters at input level
  const { onChange: formUsernameChange, ...usernameFieldProps } = register("username");

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    // Only allow English letters A-Z and a-z
    const sanitizedValue = rawValue.replace(/[^A-Za-z]/g, "");

    if (rawValue !== sanitizedValue) {
      const cursorPos = e.target.selectionStart ?? sanitizedValue.length;
      const removedCount = rawValue.length - sanitizedValue.length;
      const newPos = Math.max(0, cursorPos - removedCount);
      e.target.value = sanitizedValue;
      requestAnimationFrame(() => {
        e.target.setSelectionRange(newPos, newPos);
      });
    }

    formUsernameChange(e);
  };

  // Map server errors injected from parent
  useEffect(() => {
    if (serverFieldErrors) {
      Object.entries(serverFieldErrors).forEach(([field, msg]) => {
        if (msg) setError(field as keyof UserCreateFormData, { type: "server", message: msg as string });
      });
    }
  }, [serverFieldErrors, setError]);

  const onSubmitForm = (data: UserCreateFormData) => {
    onSubmit(data);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden w-full max-w-4xl mx-auto">
      {/* Card header */}
      <div className="px-6 sm:px-8 py-3.5 border-b border-gray-100 flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm flex-shrink-0">
          <div className="h-full w-full bg-white rounded-xl flex items-center justify-center text-rms-charcoal">
            <UserPlusIcon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-rms-charcoal">Thêm người dùng mới</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tạo tài khoản cho nhân viên hoặc quản trị viên.</p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-4 sm:py-5">
        <Alert type="error" message={errorMessage} />

        <form onSubmit={handleSubmit(onSubmitForm)} noValidate className="rms-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3 w-full">
            {/* Username */}
            <FormField
              label="Tên đăng nhập"
              id="create-username"
              required
              error={errors.username?.message}
              icon={<UserIcon className="w-5 h-5" strokeWidth={1.8} />}
              className="w-full min-w-0"
              inputWrapClassName="w-full min-w-0"
            >
              <input
                id="create-username"
                type="text"
                autoComplete="username"
                placeholder="Nhập tên đăng nhập"
                maxLength={50}
                className="rms-field__input w-full min-w-0"
                disabled={isPending}
                {...usernameFieldProps}
                onChange={handleUsernameChange}
              />
            </FormField>

            {/* Full Name */}
            <FormField
              label="Họ và tên"
              id="create-fullname"
              required
              error={errors.fullName?.message}
              icon={<UserIcon className="w-5 h-5" strokeWidth={1.8} />}
              className="w-full min-w-0"
              inputWrapClassName="w-full min-w-0"
            >
              <input
                id="create-fullname"
                type="text"
                autoComplete="name"
                placeholder="Nhập họ và tên"
                className="rms-field__input w-full min-w-0"
                disabled={isPending}
                {...register("fullName")}
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email"
              id="create-email"
              required
              error={errors.email?.message}
              icon={<EnvelopeIcon className="w-5 h-5" strokeWidth={1.8} />}
              className="w-full min-w-0"
              inputWrapClassName="w-full min-w-0"
            >
              <input
                id="create-email"
                type="email"
                autoComplete="email"
                placeholder="Nhập email"
                className="rms-field__input w-full min-w-0"
                disabled={isPending}
                {...register("email")}
              />
            </FormField>

            {/* Phone */}
            <FormField
              label="Số điện thoại"
              id="create-phone"
              required
              error={errors.phone?.message}
              icon={<PhoneIcon className="w-5 h-5" strokeWidth={1.8} />}
              className="w-full min-w-0"
              inputWrapClassName="w-full min-w-0"
            >
              <input
                id="create-phone"
                type="tel"
                autoComplete="tel"
                placeholder="Nhập số điện thoại"
                className="rms-field__input w-full min-w-0"
                disabled={isPending}
                {...register("phone")}
              />
            </FormField>

            {/* Password */}
            <div className="flex flex-col w-full min-w-0">
              <FormField
                label="Mật khẩu"
                id="create-password"
                required
                error={errors.password?.message}
                className="w-full min-w-0"
                inputWrapClassName="w-full min-w-0"
              >
                <PasswordInput
                  id="create-password"
                  autoComplete="new-password"
                  placeholder="Nhập mật khẩu"
                  disabled={isPending}
                  hasError={!!errors.password}
                  className="w-full min-w-0"
                  leftIcon={<LockClosedIcon className="w-5 h-5" strokeWidth={1.8} />}
                  {...register("password")}
                />
              </FormField>

              {/* Real-time Password Strength Meter */}
              {passwordValue.length > 0 && (
                <PasswordStrengthMeter password={passwordValue} className="px-1 mt-1" />
              )}
            </div>

            {/* Role */}
            <FormField
              label="Vai trò"
              id="create-role"
              required
              error={errors.role?.message}
              className="w-full min-w-0"
              inputWrapClassName="w-full min-w-0"
            >
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    id="create-role"
                    placeholder="Chọn vai trò"
                    options={ROLE_SELECT_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    hasError={!!errors.role}
                    icon={<ShieldCheckIcon className="w-5 h-5" strokeWidth={1.8} />}
                  />
                )}
              />
            </FormField>

            {/* Status */}
            <FormField
              label="Trạng thái"
              id="create-status"
              error={errors.isActive?.message}
              className="w-full min-w-0"
              inputWrapClassName="w-full min-w-0"
            >
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    id="create-status"
                    placeholder="Chọn trạng thái"
                    options={STATUS_OPTIONS}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    hasError={!!errors.isActive}
                    icon={<CheckCircleIcon className="w-5 h-5" strokeWidth={1.8} />}
                  />
                )}
              />
            </FormField>
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
                <span>Tiếp tục</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
