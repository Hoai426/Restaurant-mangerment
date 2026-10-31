"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { FormField } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import type { User, UserUpdateProfileRequest, UserUpdateProfileResponse } from "@/types/user";
import { userProfileSchema } from "../utils/validation";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { mapServerErrorsToForm } from "@/utils/form-errors";
import { z } from "zod";

type UserProfileFormData = z.infer<typeof userProfileSchema>;

export interface UserProfileEditFormProps {
  user: User;
  /** Called when the backend signals an email-change OTP is required. */
  onEmailChangePending: (tempToken: string, email: string) => void;
  /** Called when the profile is saved without an email change. */
  onSaveSuccess: () => void;
  /** Called when the user cancels editing. */
  onCancel: () => void;
}

export default function UserProfileEditForm({
  user,
  onEmailChangePending,
  onSaveSuccess,
  onCancel,
}: UserProfileEditFormProps) {
  const [globalError, setGlobalError] = useState("");
  const [pendingNewEmail, setPendingNewEmail] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UserProfileFormData>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
    },
  });

  const updateMutation = useUpdateProfile({
    onSuccess: (data: UserUpdateProfileResponse) => {
      setGlobalError("");

      // Backend signals that a new email requires OTP verification.
      if (data?.emailChangeTempToken || data?.emailPendingVerification) {
        onEmailChangePending(
          data.emailChangeTempToken || "",
          pendingNewEmail || data.email || user.email || ""
        );
        return;
      }

      onSaveSuccess();
    },
    onError: (err: Error) => {
      // mapServerErrorsToForm maps field-level errors directly onto the RHF fields.
      // Non-field errors fall back to the global error state.
      mapServerErrorsToForm<UserProfileFormData>(
        err,
        setError,
        setGlobalError,
        ["fullName", "email", "phone"]
      );
    },
  });

  const onSubmitForm = (formData: UserProfileFormData) => {
    const changedData: UserUpdateProfileRequest = {};
    if (formData.fullName !== user.fullName) changedData.fullName = formData.fullName;
    if (formData.email !== user.email) {
      changedData.email = formData.email;
      setPendingNewEmail(formData.email);
    }
    if (formData.phone !== user.phone) changedData.phone = formData.phone;

    // Nothing changed — treat as cancel.
    if (Object.keys(changedData).length === 0) {
      onCancel();
      return;
    }

    setGlobalError("");
    updateMutation.mutate(changedData);
  };

  const isPending = updateMutation.isPending;

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-2xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="px-6 sm:px-8 py-4 border-b border-gray-100 flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm flex-shrink-0">
          <div className="h-full w-full bg-white rounded-xl flex items-center justify-center text-rms-charcoal">
            <PencilSquareIcon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-rms-charcoal">Chỉnh sửa hồ sơ</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cập nhật thông tin tài khoản của bạn.
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-5">
        <Alert type="error" message={globalError} />

        <form onSubmit={handleSubmit(onSubmitForm)} noValidate className="rms-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full name */}
            <FormField
              label="Họ và tên"
              id="edit-profile-fullname"
              required
              error={errors.fullName?.message}
              icon={<UserIcon className="w-5 h-5" strokeWidth={1.8} />}
            >
              <input
                id="edit-profile-fullname"
                type="text"
                autoComplete="name"
                placeholder="Nhập họ và tên"
                disabled={isPending}
                className={`rms-field__input pl-11 ${
                  errors.fullName ? "rms-field__input--error" : ""
                }`}
                {...register("fullName")}
              />
            </FormField>

            {/* Email */}
            <FormField
              label="Email"
              id="edit-profile-email"
              required
              error={errors.email?.message}
              icon={<EnvelopeIcon className="w-5 h-5" strokeWidth={1.8} />}
            >
              <input
                id="edit-profile-email"
                type="email"
                autoComplete="email"
                placeholder="Nhập email"
                disabled={isPending}
                className={`rms-field__input pl-11 ${
                  errors.email ? "rms-field__input--error" : ""
                }`}
                {...register("email")}
              />
            </FormField>

            {/* Phone */}
            <div className="col-span-1 md:col-span-2">
              <FormField
                label="Số điện thoại"
                id="edit-profile-phone"
                required
                error={errors.phone?.message}
                icon={<PhoneIcon className="w-5 h-5" strokeWidth={1.8} />}
              >
                <input
                  id="edit-profile-phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="Nhập số điện thoại"
                  disabled={isPending}
                  className={`rms-field__input pl-11 ${
                    errors.phone ? "rms-field__input--error" : ""
                  }`}
                  {...register("phone")}
                />
              </FormField>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              disabled={isPending}
              title="Hủy"
              aria-label="Hủy"
              className="h-10 px-4 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:text-rms-burgundy hover:bg-gray-50 hover:border-rms-burgundy/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              <span className="font-medium text-sm">Hủy</span>
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
