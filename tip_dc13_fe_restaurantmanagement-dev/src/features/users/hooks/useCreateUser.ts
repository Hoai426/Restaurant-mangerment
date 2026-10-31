import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/services/api-client";
import { userService } from "@/features/users/services/user.service";
import type { CreateUserRequest, CreateUserResponse } from "@/types/user";

type FieldErrors = Partial<Record<keyof CreateUserRequest, string>>;

interface UseCreateUserOptions {
  onSuccess: (result: CreateUserResponse, submittedEmail: string) => void;
}

interface UseCreateUserReturn {
  mutate: (data: CreateUserRequest) => void;
  isPending: boolean;
  fieldErrors: FieldErrors;
  errorMessage: string;
  clearErrors: () => void;
}

export function useCreateUser({
  onSuccess,
}: UseCreateUserOptions): UseCreateUserReturn {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useMutation({
    mutationFn: (data: CreateUserRequest) => userService.createUser(data),

    onSuccess: (result, variables) => {
      setFieldErrors({});
      setErrorMessage("");
      onSuccess(result, variables.email);
    },

    onError: (err: Error) => {
      if (err instanceof ApiError) {
        // Map backend field-level validation errors (400)
        if (err.status === 400 && err.errors && err.errors.length > 0) {
          const mapped: FieldErrors = {};
          for (const item of err.errors) {
            const key = item.field as keyof CreateUserRequest;
            mapped[key] = item.message;
          }
          setFieldErrors(mapped);
        }

        if (err.status === 401) {
          setErrorMessage(
            "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại."
          );
          return;
        }

        if (err.status === 403) {
          setErrorMessage(
            "Bạn không có quyền tạo người dùng. Chỉ ADMIN được phép thực hiện thao tác này."
          );
          return;
        }

        if (err.status === 409) {
          setErrorMessage(
            err.message || "Username hoặc email đã tồn tại trong hệ thống."
          );
          return;
        }

        if (err.status >= 500) {
          setErrorMessage("Máy chủ đang gặp sự cố. Vui lòng thử lại sau.");
          return;
        }

        setErrorMessage(err.message || "Không thể tạo người dùng. Vui lòng thử lại.");
        return;
      }

      setErrorMessage("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    fieldErrors,
    errorMessage,
    clearErrors: () => {
      setFieldErrors({});
      setErrorMessage("");
    },
  };
}
