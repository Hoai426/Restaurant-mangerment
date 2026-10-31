import { apiClient } from "@/services/api-client";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  OtpVerifyRequest,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyForgotOtpResponse,
  ResetPasswordRequest,
  RefreshResponse,
} from "@/types/auth";

export const authService = {
  login(data: LoginRequest) {
    return apiClient<LoginResponse>("/auth/login", { method: "POST", body: data });
  },

  register(data: RegisterRequest) {
    return apiClient<RegisterResponse>("/auth/register", { method: "POST", body: data });
  },

  verifyRegistrationOtp(data: OtpVerifyRequest) {
    return apiClient<{ message: string }>("/auth/verify-registration-otp", { method: "POST", body: data });
  },

  resendRegistrationOtp(email: string) {
    return apiClient<{ message: string }>("/auth/resend-registration-otp", { method: "POST", body: { email } });
  },

  forgotPassword(data: ForgotPasswordRequest) {
    return apiClient<ForgotPasswordResponse>("/auth/forgot-password", { method: "POST", body: data });
  },

  verifyForgotPasswordOtp(data: OtpVerifyRequest) {
    return apiClient<VerifyForgotOtpResponse>("/auth/verify-forgot-password-otp", { method: "POST", body: data });
  },

  resetPassword(data: ResetPasswordRequest) {
    return apiClient<{ message: string }>("/auth/reset-password", { method: "POST", body: data });
  },

  logout(refreshToken?: string) {
    return apiClient<{ message: string }>("/auth/logout", {
      method: "POST",
      body: refreshToken ? { refreshToken } : undefined,
    });
  },

  refresh(refreshToken: string) {
    return apiClient<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  },
};