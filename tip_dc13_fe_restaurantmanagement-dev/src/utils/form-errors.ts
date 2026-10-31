import { UseFormSetError, Path } from "react-hook-form";
import { ApiError } from "@/services/api-client";

/**
 * Maps standard API errors to React Hook Form's setError or a global error message.
 * @param error The unknown error caught from try/catch or react-query onError.
 * @param setError RHF's setError function.
 * @param setGlobalError A state setter for application-level alert messages.
 * @param allowedFields An optional array of field names that are allowed to be mapped.
 */
export function mapServerErrorsToForm<T extends Record<string, unknown>>(
  error: unknown,
  setError: UseFormSetError<T>,
  setGlobalError: (msg: string) => void,
  allowedFields?: (keyof T)[]
) {
  if (error instanceof ApiError) {
    // 400 Bad Request or 409 Conflict with field-level errors
    if ((error.status === 400 || error.status === 409) && error.errors && error.errors.length > 0) {
      let mappedAny = false;
      error.errors.forEach((err) => {
        if (!allowedFields || allowedFields.includes(err.field as keyof T)) {
          setError(err.field as Path<T>, {
            type: "server",
            message: err.message,
          });
          mappedAny = true;
        }
      });
      
      if (!mappedAny) {
        setGlobalError(error.message || "Dữ liệu không hợp lệ.");
      }
      return;
    }

    if (error.status === 409) {
       setGlobalError(error.message || "Xung đột dữ liệu.");
       return;
    }

    if (error.status === 403) {
      setGlobalError("Bạn không có quyền thực hiện thao tác này.");
      return;
    }

    // For 404, we typically handle routing at the component level before calling this utility.
    // If it reaches here, we just show the message.
    setGlobalError(error.message || "Có lỗi xảy ra từ máy chủ.");
    return;
  }

  // Fallback for non-ApiError
  if (error instanceof Error) {
    setGlobalError(error.message);
  } else {
    setGlobalError("Đã xảy ra lỗi không xác định.");
  }
}
