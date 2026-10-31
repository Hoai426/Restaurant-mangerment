"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { userService } from "@/features/users";
import {
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  HashtagIcon,
  PencilIcon,
  KeyIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { Alert } from "@/components/ui/Alert";
import { getRoleFromToken } from "@/utils/auth";
import { getAccessToken } from "@/utils/cookie";
import { useUpdateUserStatus } from "@/features/users/hooks/useUpdateUserStatus";
import { getRoleLabel, getStatusLabel } from "@/constants/user.constants";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

/** Formats date to Vietnamese locale */
function formatDate(iso: string): string {
  try {
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

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-500 flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-500 normal-case">
          {label}
        </p>
        <p className="text-sm font-medium text-rms-charcoal mt-0.5 break-all">
          {value}
        </p>
      </div>
    </div>
  );
}

interface UserDetailPageProps {
  userId: number;
}

export default function UserDetailPage({ userId }: UserDetailPageProps) {
  const router = useRouter();
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    const token = getAccessToken();
    if (token && getRoleFromToken(token) === "ADMIN") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAdmin(true);
    }
  }, []);

  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => userService.getUserById(userId),
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserStatus({
    onSuccess: () => {
      setAlert({
        type: "success",
        message: user?.isActive
          ? "Vô hiệu hóa người dùng thành công"
          : "Kích hoạt người dùng thành công",
      });
      setShowConfirm(false);
    },
    onError: (err) => {
      setAlert({ type: "error", message: getApiErrorMessage(err).message });
      setShowConfirm(false);
    }
  });

  const handleStatusChange = () => {
    updateStatus({ id: userId, data: { isActive: !user?.isActive } });
  };

  const handleBack = () => {
    router.push("/dashboard/users");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <IconSpinner />
        <p className="mt-4 text-sm font-medium">
          Đang tải thông tin người dùng...
        </p>
      </div>
    );
  }

  if (isError || !user) {
    const errorInfo = isError
      ? getApiErrorMessage(error)
      : {
          title: "Không tìm thấy người dùng",
          message: "Người dùng không tồn tại hoặc đã bị xóa khỏi hệ thống.",
        };

    return (
      <div>
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center text-gray-500 hover:text-rms-burgundy transition-colors mb-6 cursor-pointer"
          title="Quay lại danh sách"
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
            <ExclamationTriangleIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-rms-charcoal">
            {errorInfo.title || "Không thể tải thông tin người dùng"}
          </h3>
          <p className="text-sm text-gray-500 mt-1 max-w-sm">
            {errorInfo.message}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient shadow-sm hover:opacity-95 transition-colors cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleBack}
        className="flex items-center text-gray-500 hover:text-rms-burgundy transition-colors mb-6"
        title="Quay lại danh sách"
      >
        <ArrowLeftIcon className="w-6 h-6" />
      </button>

      {alert && <Alert type={alert.type} message={alert.message} />}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-rms-charcoal tracking-tight">
          Thông tin người dùng
        </h1>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push(`/dashboard/users/${userId}/change-password`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rms-gold transition-all duration-200"
            >
              <KeyIcon className="-ml-1 mr-2 h-4 w-4 text-gray-500" />
              Đổi mật khẩu
            </button>
            <button
              onClick={() => router.push(`/dashboard/users/${userId}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-rms-gold hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rms-gold transition-all duration-200"
            >
              <PencilIcon className="-ml-1 mr-2 h-4 w-4" />
              Chỉnh sửa
            </button>
            {user && (
              <button
                onClick={() => (user.isActive ? setShowConfirm(true) : handleStatusChange())}
                disabled={isUpdatingStatus}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                  user.isActive
                    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdatingStatus ? (
                  <IconSpinner />
                ) : user.isActive ? (
                  <NoSymbolIcon className="-ml-1 mr-2 h-4 w-4" />
                ) : (
                  <CheckCircleIcon className="-ml-1 mr-2 h-4 w-4" />
                )}
                {user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
              </button>
            )}
          </div>
        )}
      </div>

      {showConfirm && (
        <div className="mb-6 bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-between gap-4">
          <p className="text-sm text-red-800 font-medium">
            Bạn có chắc chắn muốn vô hiệu hóa người dùng này? Người dùng sẽ không thể đăng nhập vào hệ thống.
          </p>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isUpdatingStatus}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleStatusChange}
              disabled={isUpdatingStatus}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 inline-flex items-center"
            >
              {isUpdatingStatus && <IconSpinner />}
              Đồng ý
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-5">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm flex-shrink-0">
            <div className="h-full w-full bg-white rounded-full flex items-center justify-center text-rms-charcoal">
              <UserIcon className="w-7 h-7" />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-rms-charcoal truncate">
              {user.fullName}
            </h2>
            <p className="text-sm text-gray-500 font-mono mt-0.5">
              @{user.username}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="rms-badge rms-badge--role">{getRoleLabel(user.role)}</span>
              <span
                className={`rms-badge ${user.isActive ? "rms-badge--active" : "rms-badge--inactive"}`}
              >
                {getStatusLabel(user.isActive)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            icon={<HashtagIcon className="w-5 h-5" />}
            label="ID"
            value={String(user.id)}
          />
          <InfoField
            icon={<EnvelopeIcon className="w-5 h-5" />}
            label="Email"
            value={user.email}
          />
          <InfoField
            icon={<PhoneIcon className="w-5 h-5" />}
            label="Số điện thoại"
            value={user.phone}
          />
          <InfoField
            icon={<CalendarDaysIcon className="w-5 h-5" />}
            label="Ngày tạo"
            value={formatDate(user.createdAt)}
          />
          <InfoField
            icon={<CalendarDaysIcon className="w-5 h-5" />}
            label="Cập nhật lần cuối"
            value={formatDate(user.updatedAt)}
          />
        </div>
      </div>
    </div>
  );
}
