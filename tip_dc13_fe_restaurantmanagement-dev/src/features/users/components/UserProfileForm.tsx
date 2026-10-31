"use client";

import { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { Alert } from "@/components/ui/Alert";
import type { User } from "@/types/user";
import { getRoleLabel, getStatusLabel } from "@/constants/user.constants";
import UserProfileEditForm from "./UserProfileEditForm";
import ProfileEmailOtpVerification from "./ProfileEmailOtpVerification";

function formatDate(iso: string): string {
  try {
    if (!iso) return "N/A";
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export interface UserProfileFormProps {
  user: User;
  onCancel: () => void;
}

// Represents the state while waiting for an email-change OTP.
interface PendingEmailVerification {
  tempToken: string;
  email: string;
}

export default function UserProfileForm({
  user,
  onCancel,
}: UserProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [pendingEmailVerification, setPendingEmailVerification] =
    useState<PendingEmailVerification | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // OTP flow: backend has confirmed email change and issued a tempToken.
  if (pendingEmailVerification) {
    return (
      <ProfileEmailOtpVerification
        email={pendingEmailVerification.email}
        tempToken={pendingEmailVerification.tempToken}
        onSuccess={() => {
          setPendingEmailVerification(null);
          setSuccessMessage("Cập nhật hồ sơ và email thành công!");
        }}
        onBack={() => {
          setPendingEmailVerification(null);
          setIsEditing(true);
        }}
      />
    );
  }

  // Edit mode — UserProfileEditForm owns its own mutation and error state.
  if (isEditing) {
    return (
      <UserProfileEditForm
        user={user}
        onEmailChangePending={(tempToken, email) => {
          setIsEditing(false);
          setPendingEmailVerification({ tempToken, email });
        }}
        onSaveSuccess={() => {
          setIsEditing(false);
          setSuccessMessage("Cập nhật hồ sơ thành công!");
        }}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  // Read-only view mode.
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-4xl mx-auto flex flex-col max-h-[calc(100vh-3rem)] animate-fade-in-up">
      {/* Card header */}
      <div className="px-6 sm:px-8 py-3.5 border-b border-gray-100 flex items-center gap-3.5 shrink-0 bg-white">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm flex-shrink-0">
          <div className="h-full w-full bg-white rounded-xl flex items-center justify-center text-rms-charcoal">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold text-rms-charcoal">Hồ sơ cá nhân</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Thông tin chi tiết tài khoản của bạn.
          </p>
        </div>
      </div>

      <div className="px-6 sm:px-8 py-3 sm:py-4 overflow-y-auto flex-1">
        {successMessage && (
          <div className="mb-4">
            <Alert type="success" message={successMessage} />
          </div>
        )}

        <div className="rms-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-2">
            {/* Username */}
            <div className="rms-field">
              <label htmlFor="profile-username" className="rms-field__label">
                Tên đăng nhập
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <UserIcon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <input
                  id="profile-username"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={user.username}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Role */}
            <div className="rms-field">
              <label htmlFor="profile-role" className="rms-field__label">
                Vai trò
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <ShieldCheckIcon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <input
                  id="profile-role"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={getRoleLabel(user.role)}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Status */}
            <div className="rms-field">
              <label htmlFor="profile-status" className="rms-field__label">
                Trạng thái
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <CheckCircleIcon
                    className={`w-5 h-5 ${
                      user.isActive ? "text-green-500" : "text-gray-400"
                    }`}
                    strokeWidth={1.8}
                  />
                </span>
                <input
                  id="profile-status"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={getStatusLabel(user.isActive)}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Email Verified */}
            <div className="rms-field">
              <label
                htmlFor="profile-email-verified"
                className="rms-field__label"
              >
                Xác thực Email
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <CheckCircleIcon
                    className={`w-5 h-5 ${
                      user.emailVerified ? "text-green-500" : "text-gray-400"
                    }`}
                    strokeWidth={1.8}
                  />
                </span>
                <input
                  id="profile-email-verified"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={user.emailVerified ? "Đã xác thực" : "Chưa xác thực"}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Created At */}
            <div className="rms-field">
              <label
                htmlFor="profile-created-at"
                className="rms-field__label"
              >
                Ngày tạo
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <CalendarDaysIcon
                    className="w-5 h-5 text-gray-400"
                    strokeWidth={1.8}
                  />
                </span>
                <input
                  id="profile-created-at"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={formatDate(user.createdAt)}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Updated At */}
            <div className="rms-field">
              <label
                htmlFor="profile-updated-at"
                className="rms-field__label"
              >
                Cập nhật lần cuối
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <CalendarDaysIcon
                    className="w-5 h-5 text-gray-400"
                    strokeWidth={1.8}
                  />
                </span>
                <input
                  id="profile-updated-at"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={formatDate(user.updatedAt)}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 mt-2 mb-0.5 border-t border-gray-100 pt-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-rms-gold" strokeWidth={2} />
                Thông tin cá nhân
              </h3>
            </div>

            {/* Full name */}
            <div className="rms-field">
              <label htmlFor="profile-fullname" className="rms-field__label">
                Họ và tên
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <UserIcon
                    className="w-5 h-5 text-gray-400"
                    strokeWidth={1.8}
                  />
                </span>
                <input
                  id="profile-fullname"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={user.fullName || "N/A"}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Email */}
            <div className="rms-field">
              <label htmlFor="profile-email" className="rms-field__label">
                Email
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <EnvelopeIcon
                    className="w-5 h-5 text-gray-400"
                    strokeWidth={1.8}
                  />
                </span>
                <input
                  id="profile-email"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={user.email}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="rms-field">
              <label htmlFor="profile-phone" className="rms-field__label">
                Số điện thoại
              </label>
              <div className="rms-field__input-wrap">
                <span className="rms-field__icon" aria-hidden="true">
                  <PhoneIcon
                    className="w-5 h-5 text-gray-400"
                    strokeWidth={1.8}
                  />
                </span>
                <input
                  id="profile-phone"
                  type="text"
                  className="rms-field__input bg-gray-50 text-gray-500 cursor-not-allowed pl-11"
                  value={user.phone || "N/A"}
                  readOnly
                  aria-readonly="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 sm:px-8 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          title="Đóng"
          aria-label="Đóng"
          className="h-10 px-4 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:text-rms-burgundy hover:bg-gray-50 hover:border-rms-burgundy/30 transition-colors shrink-0"
        >
          <span className="font-medium text-sm">Đóng</span>
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="h-10 px-4 inline-flex items-center justify-center gap-2 rounded-xl bg-rms-gradient text-white font-medium text-sm shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 shrink-0"
        >
          <PencilSquareIcon className="w-4 h-4" />
          <span>Chỉnh sửa hồ sơ</span>
        </button>
      </div>
    </div>
  );
}
