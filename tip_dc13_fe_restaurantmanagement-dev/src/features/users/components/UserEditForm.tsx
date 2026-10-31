"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import type { User, UserUpdateRequest } from "@/types/user";
import { userEditSchema } from "../utils/validation";
import { ROLE_SELECT_OPTIONS, STATUS_OPTIONS } from "@/constants/user.constants";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { z } from "zod";

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

export interface UserEditFormProps {
  user: User;
  isPending: boolean;
  onSubmit: (data: UserUpdateRequest) => void;
  onCancel: () => void;
  serverFieldErrors: FieldErrors<UserUpdateRequest>;
  errorMessage: string;
  successMessage: string;
}

type UserEditFormData = z.infer<typeof userEditSchema>;

export default function UserEditForm({
  user,
  isPending,
  onSubmit,
  onCancel,
  serverFieldErrors,
  errorMessage,
  successMessage,
}: UserEditFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<UserEditFormData>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    },
  });

  // Map server errors injected from parent
  useEffect(() => {
    if (serverFieldErrors) {
      Object.entries(serverFieldErrors).forEach(([field, msg]) => {
        if (msg) setError(field as keyof UserEditFormData, { type: "server", message: msg as string });
      });
    }
  }, [serverFieldErrors, setError]);

  const onSubmitForm = (data: UserEditFormData) => {
    // Only send fields that actually changed
    const changedData: UserUpdateRequest = {};
    if (data.fullName !== user.fullName) changedData.fullName = data.fullName;
    if (data.email !== user.email) changedData.email = data.email;
    if (data.phone !== user.phone) changedData.phone = data.phone;
    if (data.role !== user.role) changedData.role = data.role;
    if (data.isActive !== user.isActive) changedData.isActive = data.isActive;

    onSubmit(changedData);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden w-full max-w-4xl mx-auto">
      {/* Card header */}
      <div className="px-6 sm:px-8 py-3.5 border-b border-gray-100 flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm flex-shrink-0">
          <div className="h-full w-full bg-white rounded-xl flex items-center justify-center text-rms-charcoal">
            <PencilSquareIcon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-rms-charcoal">Chỉnh sửa người dùng</h1>
          <p className="text-sm text-gray-500 mt-0.5">Cập nhật thông tin tài khoản người dùng.</p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-4 sm:py-5">
        <Alert type="success" message={successMessage} />
        <Alert type="error" message={errorMessage} />

        <form onSubmit={handleSubmit(onSubmitForm)} noValidate className="rms-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
            {/* Username (readonly) */}
            <div className="rms-field">
              <label htmlFor="edit-username" className="rms-field__label">
                Tên đăng nhập
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <UserIcon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <input
                  id="edit-username"
                  type="text"
                  autoComplete="username"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={user.username}
                  readOnly
                  disabled={isPending}
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Full name */}
            <FormField
              label="Họ và tên"
              id="edit-fullname"
              error={errors.fullName?.message}
              icon={<UserIcon className="w-5 h-5" strokeWidth={1.8} />}
            >
              <input
                id="edit-fullname"
                type="text"
                autoComplete="name"
                placeholder="Nhập họ và tên"
                className="rms-field__input pl-11"
                disabled={isPending}
                {...register("fullName")}
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email"
              id="edit-email"
              error={errors.email?.message}
              icon={<EnvelopeIcon className="w-5 h-5" strokeWidth={1.8} />}
            >
              <input
                id="edit-email"
                type="email"
                autoComplete="email"
                placeholder="Nhập email"
                className="rms-field__input pl-11"
                disabled={isPending}
                {...register("email")}
              />
            </FormField>

            {/* Phone */}
            <FormField
              label="Số điện thoại"
              id="edit-phone"
              error={errors.phone?.message}
              icon={<PhoneIcon className="w-5 h-5" strokeWidth={1.8} />}
            >
              <input
                id="edit-phone"
                type="tel"
                autoComplete="tel"
                placeholder="Nhập số điện thoại"
                className="rms-field__input pl-11"
                disabled={isPending}
                {...register("phone")}
              />
            </FormField>

            {/* Role */}
            <FormField
              label="Vai trò"
              id="edit-role"
              error={errors.role?.message}
            >
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select
                    id="edit-role"
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
              id="edit-status"
              error={errors.isActive?.message}
            >
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Select
                    id="edit-status"
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
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
