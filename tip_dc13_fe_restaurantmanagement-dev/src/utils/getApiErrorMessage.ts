import { ApiError } from "@/services/api-client";

export interface ApiErrorMessage {
  title: string;
  message: string;
}

/**
 * Friendly, user-facing messages keyed by backend error code.
 * Codes mirror the backend `ErrorCode` constants so raw technical
 * details are never surfaced to the UI.
 */
const ERROR_CODE_MESSAGES: Record<string, ApiErrorMessage> = {
  UNAUTHORIZED: {
    title: "Phiên làm việc hết hạn",
    message: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
  },
  AUTH_TOKEN_EXPIRED: {
    title: "Phiên làm việc hết hạn",
    message: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
  },
  ACCESS_DENIED: {
    title: "Từ chối truy cập",
    message: "Bạn không có quyền thực hiện thao tác này.",
  },
  USER_NOT_FOUND: {
    title: "Không tìm thấy người dùng",
    message: "Người dùng không tồn tại hoặc đã bị xóa khỏi hệ thống.",
  },
  USER_EXISTS: {
    title: "Người dùng đã tồn tại",
    message: "Email hoặc tài khoản người dùng này đã tồn tại trong hệ thống.",
  },
  USER_ALREADY_EXISTS: {
    title: "Người dùng đã tồn tại",
    message: "Email hoặc tài khoản người dùng này đã tồn tại trong hệ thống.",
  },
  EMAIL_ALREADY_EXISTS: {
    title: "Email đã được sử dụng",
    message: "Địa chỉ email này đã được sử dụng bởi một tài khoản khác.",
  },
  USER_CURRENT_PASSWORD_INCORRECT: {
    title: "Mật khẩu không chính xác",
    message: "Mật khẩu hiện tại không đúng. Vui lòng kiểm tra lại.",
  },
  AUTH_OTP_INCORRECT: {
    title: "Mã OTP không đúng",
    message: "Mã xác thực OTP không chính xác. Vui lòng kiểm tra và thử lại.",
  },
  AUTH_OTP_EXPIRED: {
    title: "Mã OTP đã hết hạn",
    message: "Mã xác thực OTP đã hết hạn. Vui lòng yêu cầu gửi lại mã mới.",
  },
  AUTH_OTP_MAX_ATTEMPTS: {
    title: "Vượt quá số lần thử",
    message: "Bạn đã nhập sai mã OTP quá số lần cho phép. Vui lòng thử lại sau.",
  },
  CATEGORY_NOT_FOUND: {
    title: "Không tìm thấy danh mục",
    message: "Danh mục không tồn tại hoặc đã bị xóa.",
  },
  CATEGORY_EXISTS: {
    title: "Danh mục đã tồn tại",
    message: "Danh mục này đã tồn tại trong thực đơn.",
  },
  RESOURCE_ALREADY_EXISTS: {
    title: "Dữ liệu đã tồn tại",
    message: "Dữ liệu đã tồn tại hoặc xung đột với dữ liệu hiện có.",
  },
  DISH_NOT_FOUND: {
    title: "Không tìm thấy món ăn",
    message: "Món ăn không tồn tại hoặc đã bị gỡ khỏi thực đơn.",
  },
  DISH_EXISTS: {
    title: "Món ăn đã tồn tại",
    message: "Tên món ăn này đã có trong hệ thống. Vui lòng chọn tên khác.",
  },
  TABLE_EXISTS: {
    title: "Số bàn đã tồn tại",
    message: "Số bàn đã tồn tại trong phòng này. Vui lòng chọn số bàn khác.",
  },
  TABLE_NOT_FOUND: {
    title: "Không tìm thấy bàn",
    message: "Bàn ăn không tồn tại hoặc đã bị xóa.",
  },
  ROOM_NOT_FOUND: {
    title: "Không tìm thấy phòng",
    message: "Không tìm thấy phòng ăn hoặc phòng đã bị xóa.",
  },
  VALIDATION_FAILED: {
    title: "Yêu cầu không hợp lệ",
    message: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.",
  },
  RESERVATION_CONFLICT: {
    title: "Trùng khung giờ đặt bàn",
    message: "Một số bàn đã được đặt trong khung giờ này. Vui lòng chọn bàn khác hoặc thay đổi thời gian.",
  },
  RESERVATION_NOT_FOUND: {
    title: "Không tìm thấy đặt bàn",
    message: "Đơn đặt bàn không tồn tại hoặc đã bị xóa.",
  },
  RESERVATION_NOT_EDITABLE: {
    title: "Không thể chỉnh sửa",
    message: "Đơn đặt bàn đã đóng, không thể chỉnh sửa thông tin.",
  },
  ORDER_NOT_FOUND: {
    title: "Không tìm thấy đơn hàng",
    message: "Đơn hàng không tồn tại hoặc đã bị hủy.",
  },
  ORDER_NOT_EDITABLE: {
    title: "Không thể chỉnh sửa",
    message: "Đơn hàng đã đóng, không thể thay đổi trạng thái.",
  },
  ORDER_ALREADY_PAID: {
    title: "Không thể hủy đơn",
    message: "Đơn hàng đã được thanh toán, không thể hủy.",
  },
  PAYMENT_ALREADY_EXISTS: {
    title: "Đơn hàng đã có thanh toán",
    message: "Đơn hàng này đã được tạo giao dịch thanh toán.",
  },
  PAYMENT_NOT_FOUND: {
    title: "Chưa có giao dịch",
    message: "Đơn hàng này chưa có giao dịch thanh toán nào.",
  },
  PAYMENT_ALREADY_PROCESSED: {
    title: "Giao dịch đã được xử lý",
    message: "Giao dịch thanh toán này đã được xác nhận hoặc đã hoàn tất trước đó.",
  },
};

const CONNECTION_ERROR: ApiErrorMessage = {
  title: "Lỗi kết nối",
  message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối và thử lại.",
};

const FALLBACK_ERROR: ApiErrorMessage = {
  title: "Đã xảy ra lỗi",
  message: "Không thể xử lý yêu cầu. Vui lòng thử lại sau.",
};

function getMessageByStatus(status: number): ApiErrorMessage | null {
  switch (status) {
    case 400:
      return ERROR_CODE_MESSAGES.VALIDATION_FAILED;
    case 401:
      return ERROR_CODE_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_CODE_MESSAGES.ACCESS_DENIED;
    case 404:
      return {
        title: "Không tìm thấy dữ liệu",
        message: "Không tìm thấy dữ liệu bạn yêu cầu hoặc dữ liệu đã bị xóa.",
      };
    case 409:
      return ERROR_CODE_MESSAGES.RESOURCE_ALREADY_EXISTS;
    default:
      if (status >= 500) {
        return {
          title: "Lỗi máy chủ",
          message: "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.",
        };
      }
      return null;
  }
}

/**
 * Maps a caught API error to a safe, user-facing title + message.
 *
 * Order of resolution:
 * 1. backend error code (most specific, e.g. CATEGORY_NOT_FOUND)
 * 2. HTTP status (401 / 403 / 404 / 409 / 400 / 5xx)
 * 3. generic fallback for unknown responses
 * 4. connection error for non-ApiError failures (network / offline)
 */
export function getApiErrorMessage(error: unknown): ApiErrorMessage {
  if (error instanceof ApiError) {
    // Ưu tiên domain errorCode từ backend (ví dụ RESERVATION_CONFLICT), tránh bị đè bởi HTTP phrase code ("Conflict")
    const code = error.errorCode ?? error.code;
    if (code && ERROR_CODE_MESSAGES[code]) {
      return ERROR_CODE_MESSAGES[code];
    }

    // Nếu backend trả về thông báo lỗi cụ thể
    if (error.message && error.message !== "Có lỗi xảy ra từ máy chủ") {
      const statusFallback = getMessageByStatus(error.status);
      return {
        title: statusFallback?.title ?? "Thông báo",
        message: error.message,
      };
    }

    return getMessageByStatus(error.status) ?? FALLBACK_ERROR;
  }

  return CONNECTION_ERROR;
}
