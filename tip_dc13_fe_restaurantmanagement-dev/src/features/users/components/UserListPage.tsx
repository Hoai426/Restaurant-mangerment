"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { userService } from "@/features/users";
import { UsersIcon, ExclamationTriangleIcon, PlusIcon } from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import UserTable from "./UserTable";

export default function UserListPage() {
  useRequireAuth(["ADMIN"]);
  const router = useRouter();
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.getUsers(),
  });

  const handleCreateUser = () => router.push("/dashboard/users/create");

  //  Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <IconSpinner />
        <p className="mt-4 text-sm font-medium">Đang tải danh sách người dùng...</p>
      </div>
    );
  }

  // Error State 
  if (isError) {
    const errorInfo = getApiErrorMessage(error);
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
          <ExclamationTriangleIcon className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-rms-charcoal">
          {errorInfo.title || "Không thể tải dữ liệu"}
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
    );
  }

  // Empty State
  if (!users || users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rms-gold/10 text-rms-gold flex items-center justify-center mb-3">
          <UsersIcon className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-rms-charcoal">Chưa có người dùng</h3>
        <p className="text-sm text-gray-500 mt-1 max-w-sm">
          Hiện tại không có người dùng nào trong hệ thống.
        </p>
        <button
          type="button"
          onClick={handleCreateUser}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient shadow-sm hover:opacity-95 transition-colors cursor-pointer"
        >
          <PlusIcon className="w-5 h-5" />
          Thêm người dùng
        </button>
      </div>
    );
  }

  //  Success State 
  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-rms-charcoal tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng cộng{" "}
            <span className="font-semibold text-rms-burgundy">{users.length}</span>{" "}
            người dùng
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateUser}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient"
          
        >
          <PlusIcon className="w-5 h-5" />
          Thêm người dùng
        </button>
      </div>

      {/* Table */}
      <UserTable users={users} />
    </div>
  );
}