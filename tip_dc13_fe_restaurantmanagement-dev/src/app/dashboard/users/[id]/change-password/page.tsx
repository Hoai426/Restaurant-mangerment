"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import UserChangePasswordForm from "@/features/users/components/UserChangePasswordForm";
import { useUpdateUser } from "@/features/users/hooks/useUpdateUser";
import { ApiError } from "@/services/api-client";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function UserChangePasswordPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  // Check auth
  const { isAuthorized } = useRequireAuth(["ADMIN"]);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const updateMutation = useUpdateUser({
    onSuccess: () => {
      setSuccessMessage("Đổi mật khẩu người dùng thành công");
      setTimeout(() => router.push("/dashboard/users"), 1200);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          alert("Không tìm thấy người dùng");
          router.push("/dashboard/users");
        } else if (err.status === 403) {
          setErrorMessage("Bạn không có quyền thực hiện thao tác này");
        } else {
          setErrorMessage(err.message || "Đã xảy ra lỗi");
        }
      } else {
        setErrorMessage("Không thể kết nối đến máy chủ");
      }
    },
  });

  const handleSubmit = (data: { password: string }) => {
    setErrorMessage("");
    updateMutation.mutate({ id: userId, data });
  };

  if (isAuthorized === false) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-red-500">
        <p className="text-xl font-bold">403 Forbidden</p>
        <p className="text-sm font-medium mt-2">Bạn không có quyền truy cập trang này.</p>
        <button onClick={() => router.push("/dashboard/users")} className="mt-4 text-blue-500 hover:underline">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (isAuthorized === null || isNaN(userId)) {
    return null;
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 sm:p-8 relative">
      <div className="max-w-xl mx-auto">
        <UserChangePasswordForm
          isPending={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/users")}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />
      </div>
    </div>
  );
}
