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
  XCircleIcon,
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

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-4xl mx-auto flex flex-col max-h-[calc(100vh-3rem)] animate-fade-in-up">
      {/* Card header */}
      <div className="px-6 sm:px-8 py-4 border-b border-gray-100 flex items-center justify-between gap-3.5 shrink-0 bg-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm shrink-0">
            <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-rms-burgundy">
              <UserIcon className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-rms-charcoal">Hồ sơ cá nhân</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Thông tin chi tiết tài khoản của bạn.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="h-9 px-3.5 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rms-gradient text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow transition-all cursor-pointer"
        >
          <PencilSquareIcon className="w-4 h-4" />
          <span>Chỉnh sửa</span>
        </button>
      </div>

      <div className="px-6 sm:px-8 py-5 overflow-y-auto flex-1 space-y-6">
        {successMessage && (
          <div>
            <Alert type="success" message={successMessage} />
          </div>
        )}

        {/* Section 1: Thông tin hệ thống */}
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Thông tin tài khoản hệ thống
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-gray-400" />
                <span>Tên đăng nhập</span>
              </dt>
              <dd className="mt-1 font-mono text-sm font-bold text-gray-900 truncate">
                {user.username}
              </dd>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-gray-400" />
                <span>Vai trò</span>
              </dt>
              <dd className="mt-1 text-sm font-semibold text-rms-burgundy">
                {getRoleLabel(user.role)}
              </dd>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <CheckCircleIcon className="w-4 h-4 text-gray-400" />
                <span>Trạng thái</span>
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                {user.isActive ? (
                  <span className="text-emerald-700">{getStatusLabel(user.isActive)}</span>
                ) : (
                  <span className="text-gray-500">{getStatusLabel(user.isActive)}</span>
                )}
              </dd>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <span>Xác thực Email</span>
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
                {user.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                    <span>Đã xác thực</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <XCircleIcon className="w-4 h-4 text-amber-600" />
                    <span>Chưa xác thực</span>
                  </span>
                )}
              </dd>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                <span>Ngày tạo tài khoản</span>
              </dt>
              <dd className="mt-1 text-xs sm:text-sm font-medium text-gray-700 font-mono">
                {formatDate(user.createdAt)}
              </dd>
            </div>

            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                <span>Cập nhật gần nhất</span>
              </dt>
              <dd className="mt-1 text-xs sm:text-sm font-medium text-gray-700 font-mono">
                {formatDate(user.updatedAt)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Section 2: Thông tin liên hệ cá nhân */}
        <div className="pt-2 border-t border-gray-100">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Thông tin liên hệ
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-gray-200">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-rms-gold" />
                <span>Họ và tên</span>
              </dt>
              <dd className="mt-1 text-sm font-bold text-gray-900">
                {user.fullName || "Chưa cập nhật"}
              </dd>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-gray-200">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <EnvelopeIcon className="w-4 h-4 text-rms-gold" />
                <span>Địa chỉ Email</span>
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 truncate">
                {user.email || "Chưa cập nhật"}
              </dd>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-gray-200">
              <dt className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                <PhoneIcon className="w-4 h-4 text-rms-gold" />
                <span>Số điện thoại</span>
              </dt>
              <dd className="mt-1 text-sm font-medium text-gray-900 font-mono">
                {user.phone || "Chưa cập nhật"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 sm:px-8 py-3.5 border-t border-gray-100 bg-gray-50/60 flex items-center justify-end gap-3 shrink-0">
        <button
          type="button"
          onClick={onCancel}
          aria-label="Đóng cửa sổ hồ sơ"
          className="h-9 px-4 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:text-rms-burgundy hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
