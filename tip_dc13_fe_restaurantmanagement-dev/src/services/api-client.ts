import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { getAccessToken, getRefreshToken, setCookie } from "@/utils/cookie";
import { clearAuthCookies } from "@/utils/auth";

const API_BASE_URL = env.API_URL;

export interface BackendFieldError {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  errorCode?: string;
  errors?: BackendFieldError[];

  constructor(
    message: string,
    status: number,
    options: {
      code?: string;
      errorCode?: string;
      errors?: BackendFieldError[];
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code;
    this.errorCode = options.errorCode;
    this.errors = options.errors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseFieldErrors(value: unknown): BackendFieldError[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const errors = value.filter((item): item is BackendFieldError => {
    return (
      isRecord(item) &&
      typeof item.field === "string" &&
      typeof item.message === "string"
    );
  });

  return errors.length > 0 ? errors : undefined;
}

function parseBackendFieldErrors(
  payload: Record<string, unknown>
): BackendFieldError[] | undefined {
  return parseFieldErrors(payload.errors) ?? parseFieldErrors(payload.details);
}

/**
 * Chuẩn hóa mọi lỗi (Axios, Network, etc.) sang ApiError chuẩn của hệ thống
 */
function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const data = error.response?.data;
    const payload = isRecord(data) ? data : {};

    const message =
      typeof payload.message === "string"
        ? payload.message
        : error.message || "Có lỗi xảy ra từ máy chủ";

    return new ApiError(message, status, {
      code: typeof payload.code === "string" ? payload.code : undefined,
      errorCode:
        typeof payload.errorCode === "string" ? payload.errorCode : undefined,
      errors: parseBackendFieldErrors(payload),
    });
  }

  if (error instanceof Error) {
    return new ApiError(error.message, 500);
  }

  return new ApiError("Có lỗi không xác định xảy ra", 500);
}

// ─── AXIOS INSTANCE & 401 QUEUE INTERCEPTOR ───────────────────────────────────

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

interface RetryAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Gắn Bearer Token tự động nếu chưa có
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = getAccessToken();
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Bắt 401 và tự động Refresh Token kèm Queue Lock
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout") ||
      url.includes("/auth/register");

    // Chỉ can thiệp khi gặp 401 và không phải là các endpoint xác thực cơ bản
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // CASE 1: Request này đã retry refresh trước đó nhưng vẫn bị 401 -> Tránh lặp vô hạn
      if (originalRequest._retry) {
        clearAuthCookies();
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        return Promise.reject(
          new ApiError("Phiên đăng nhập đã hết hạn hoặc không có quyền truy cập", 401)
        );
      }

      // CASE 2: Đang có 1 request khác tiến hành refresh token -> Đưa vào hàng đợi
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newAccessToken) => {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // CASE 3: Request đầu tiên nhận 401 -> Đứng ra kích hoạt refresh token
      isRefreshing = true;
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();

      // Nếu không có refresh token -> Kết thúc session và điều hướng về /login
      if (!refreshToken) {
        isRefreshing = false;
        clearAuthCookies();
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        return Promise.reject(new ApiError("Phiên đăng nhập đã hết hạn", 401));
      }

      try {
        // QUAN TRỌNG: Gọi axios.post trực tiếp (không dùng axiosInstance) để loại trừ circular refresh
        const res = await axios.post<{
          status?: number;
          message?: string;
          data?: { accessToken?: string };
          accessToken?: string;
        }>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 10000,
          }
        );

        const newAccessToken =
          res.data?.data?.accessToken || res.data?.accessToken;

        if (!newAccessToken || typeof newAccessToken !== "string") {
          throw new Error("Không nhận được access token mới từ máy chủ");
        }

        // Cập nhật cookie và axios default header
        setCookie("accessToken", newAccessToken, 604800);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        // Giải phóng toàn bộ các request đang chờ trong queue
        processQueue(null, newAccessToken);

        // Retry lại request ban đầu với token mới
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        // Refresh thất bại (401, 403, revoked...) -> Reject toàn bộ queue, clear session, chuyển về /login
        processQueue(refreshErr, null);
        clearAuthCookies();
        if (typeof window !== "undefined") {
          window.location.replace("/login");
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── PUBLIC API CLIENT WRAPPER (Tương thích ngược 100%) ───────────────────────

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  try {
    const response = await axiosInstance.request({
      url: endpoint,
      method,
      data: body,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    const data = response.data;

    // Xử lý unwrap Global Response Envelope từ backend mới
    if (isRecord(data) && "status" in data && "data" in data) {
      return (data.data ?? {}) as T;
    }

    return (data ?? {}) as T;
  } catch (error: unknown) {
    throw toApiError(error);
  }
}
