
export interface RegisterRequest {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface RegisterResponse {
  tempToken: string;
  message: string;
}

// ─── Login ───────────────────────────────────────────────────────────────────
export interface LoginRequest {
  identifier: string; // username HOẶC email
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
}

// ─── Refresh Token ───────────────────────────────────────────────────────────
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

// ─── OTP Verification (Dùng chung cho Đăng ký & Quên mật khẩu) ──────────────
export interface OtpVerifyRequest {
  tempToken: string;
  otpCode: string;
}

// ─── Forgot Password ─────────────────────────────────────────────────────────
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  tempToken: string;
  message: string;
}

export interface VerifyForgotOtpResponse {
  resetToken: string;
  message: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  newPassword: string;
}