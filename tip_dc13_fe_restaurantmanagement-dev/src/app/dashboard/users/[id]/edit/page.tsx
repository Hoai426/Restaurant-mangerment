"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import UserEditForm from "@/features/users/components/UserEditForm";
import { useUpdateUser } from "@/features/users/hooks/useUpdateUser";
import { userService } from "@/features/users/services/user.service";
import type { UserUpdateRequest } from "@/types/user";
import { ApiError } from "@/services/api-client";
import { IconSpinner } from "@/components/common/IconSpinner";
import type { FieldErrors } from "@/features/users/utils/validation";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  // Check auth
  const { isAuthorized } = useRequireAuth(["ADMIN"]);

  const { data: user, isLoading: isFetching, error: fetchError } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => userService.getUserById(userId),
    enabled: isAuthorized === true && !isNaN(userId),
  });
  
  const [serverErrors, setServerErrors] = useState<FieldErrors<UserUpdateRequest>>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const updateMutation = useUpdateUser({
    onSuccess: () => {
      setSuccessMessage("Cập nhật người dùng thành công");
      // Let the success banner be visible before redirecting (same pattern as OTP success)
      setTimeout(() => router.push("/dashboard/users"), 1200);
    },
    onError: (err) => {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.errors) {
          const errors: FieldErrors<UserUpdateRequest> = {};
          err.errors.forEach((e) => {
            const field = e.field as keyof UserUpdateRequest;
            errors[field] = e.message;
          });
          setServerErrors(errors);
        } else if (err.status === 404) {
          alert("Không tìm thấy người dùng");
          router.push("/dashboard/users");
        } else if (err.status === 409) {
          if (err.message?.toLowerCase().includes("email")) {
             setServerErrors({ email: err.message });
          } else if (err.message?.toLowerCase().includes("phone")) {
             setServerErrors({ phone: err.message });
          } else {
             setErrorMessage(err.message || "Email hoặc số điện thoại đã tồn tại");
          }
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

  const handleSubmit = (data: UserUpdateRequest) => {
    if (Object.keys(data).length === 0) {
      router.push("/dashboard/users");
      return;
    }
    setServerErrors({});
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

  if (isAuthorized === null || isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-gray-400">
        <IconSpinner />
        <p className="mt-4 text-sm font-medium">Đang tải thông tin...</p>
      </div>
    );
  }

  if (fetchError || !user) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-red-500">
        <p className="text-sm font-medium">Không thể tải thông tin. Vui lòng thử lại sau.</p>
        <button onClick={() => router.push("/dashboard/users")} className="mt-4 text-blue-500 hover:underline">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <UserEditForm
          user={user}
          isPending={updateMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/dashboard/users")}
          serverFieldErrors={serverErrors}
          errorMessage={errorMessage}
          successMessage={successMessage}
        />
      </div>
    </div>
  );
}
