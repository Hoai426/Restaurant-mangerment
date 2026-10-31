"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { RegisterRequest, OtpVerifyRequest } from "@/types/auth";
import { OtpInput } from "@/components/ui/OtpInput";
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CheckIcon,
  ShieldCheckIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { authService } from "@/features/auth/services/auth.service";
import { registerSchema } from "@/features/users/utils/validation";
import { AuthBranding } from "./AuthBranding";
import { AUTH_BRANDING_CONTENT } from "../constants/auth.constants";

// Main Form

export default function RegisterForm() {
  const router = useRouter();

  // ── Step Management ──
  const [step, setStep] = useState<"form" | "otp">("form");
  const [tempToken, setTempToken] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  // ── Step 1: Registration Form ──
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState({
    username: "", fullName: "", email: "", phone: "", password: "", confirmPassword: "",
  });

  //  Step 2: OTP Verification 
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  // ── Shared ──
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Validation 
  const validateForm = (): boolean => {
    const result = registerSchema.safeParse({
      ...formData,
      confirmPassword,
    });

    if (!result.success) {
      const errs = {
        username: "",
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      };

      for (const issue of result.error.issues) {
        const fieldName = issue.path[0] as keyof typeof errs;
        if (fieldName && !errs[fieldName]) {
          errs[fieldName] = issue.message;
        }
      }

      setFieldErrors(errs);
      return false;
    }

    setFieldErrors({
      username: "",
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    return true;
  };

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  // Handlers
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const result = await authService.register(formData);
      setTempToken(result.tempToken);
      setOtpMessage(result.message || `Mã OTP đã được gửi đến email ${formData.email}`);
      setStep("otp");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Không thể kết nối đến máy chủ Backend.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    setError("");

    if (!otpCode.trim()) {
      setOtpError("Vui lòng nhập mã OTP");
      return;
    }

    setIsLoading(true);
    try {
      const payload: OtpVerifyRequest = { tempToken, otpCode };
      await authService.verifyRegistrationOtp(payload);

      setSuccess("Tạo tài khoản thành công! Đang chuyển hướng...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      let message = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
      if (message.toLowerCase().includes("otp") || message.toLowerCase().includes("mã")) {
        message = "Mã OTP không đúng. Vui lòng kiểm tra lại!";
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");
    try {
      await authService.resendRegistrationOtp(formData.email);
      setSuccess("Đã gửi lại mã OTP mới vào email của bạn.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi gửi lại OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="rms-login-wrapper">
      <AuthBranding
        imageSrc="/register-bg.jpg"
        imageAlt="Restaurant kitchen"
        icon={<BuildingStorefrontIcon className="w-8 h-8" strokeWidth={1.5} />}
        slogan={AUTH_BRANDING_CONTENT.slogan}
        description={AUTH_BRANDING_CONTENT.description}
        features={AUTH_BRANDING_CONTENT.features}
        isDarkOverlay
        imageSizes="55vw"
        className="rms-branding--register"
      />

      <div className="rms-form-section rms-form-section--register">
        <div className="rms-form-container rms-form-container--register">

          {/* ════════ STEP 1: Form Đăng ký ════════ */}
          {step === "form" && (
            <>
              <div className="rms-form-header">
                <div className="rms-form-header__icon" aria-hidden="true">
                  <UserPlusIcon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h1 className="rms-form-header__title">Tạo tài khoản</h1>
                <p className="rms-form-header__subtitle">
                  Đăng ký để bắt đầu sử dụng hệ thống quản lý nhà hàng
                </p>
              </div>

              {error && (
                <div className="rms-alert rms-alert--error" role="alert">
                  <XCircleIcon className="w-5 h-5 shrink-0" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} noValidate className="rms-form">
                <div className="rms-field">
                  <label htmlFor="reg-username" className="rms-field__label">Tên đăng nhập</label>
                  <div className={`rms-field__input-wrap${fieldErrors.username ? " rms-field__input-wrap--error" : ""}`}>
                    <span className="rms-field__icon" aria-hidden="true"><UserIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                    <input
                      id="reg-username"
                      type="text"
                      autoComplete="username"
                      className="rms-field__input"
                      value={formData.username}
                      onChange={(e) => { setFormData({ ...formData, username: e.target.value }); clearFieldError("username"); }}
                      aria-describedby={fieldErrors.username ? "reg-username-error" : undefined}
                      aria-invalid={!!fieldErrors.username}
                    />
                  </div>
                  {fieldErrors.username && <p id="reg-username-error" className="rms-field__error" role="alert">{fieldErrors.username}</p>}
                </div>

                <div className="rms-field">
                  <label htmlFor="reg-fullname" className="rms-field__label">Họ và tên</label>
                  <div className={`rms-field__input-wrap${fieldErrors.fullName ? " rms-field__input-wrap--error" : ""}`}>
                    <span className="rms-field__icon" aria-hidden="true"><UserIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                    <input
                      id="reg-fullname"
                      type="text"
                      autoComplete="name"
                      className="rms-field__input"
                      value={formData.fullName}
                      onChange={(e) => { setFormData({ ...formData, fullName: e.target.value }); clearFieldError("fullName"); }}
                      aria-describedby={fieldErrors.fullName ? "reg-fullname-error" : undefined}
                      aria-invalid={!!fieldErrors.fullName}
                    />
                  </div>
                  {fieldErrors.fullName && <p id="reg-fullname-error" className="rms-field__error" role="alert">{fieldErrors.fullName}</p>}
                </div>

                <div className="rms-field-grid">
                  <div className="rms-field">
                    <label htmlFor="reg-email" className="rms-field__label">Email</label>
                    <div className={`rms-field__input-wrap${fieldErrors.email ? " rms-field__input-wrap--error" : ""}`}>
                      <span className="rms-field__icon" aria-hidden="true"><EnvelopeIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                      <input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        className="rms-field__input"
                        value={formData.email}
                        onChange={(e) => { setFormData({ ...formData, email: e.target.value }); clearFieldError("email"); }}
                        aria-describedby={fieldErrors.email ? "reg-email-error" : undefined}
                        aria-invalid={!!fieldErrors.email}
                      />
                    </div>
                    {fieldErrors.email && <p id="reg-email-error" className="rms-field__error" role="alert">{fieldErrors.email}</p>}
                  </div>

                  <div className="rms-field">
                    <label htmlFor="reg-phone" className="rms-field__label">Số điện thoại</label>
                    <div className={`rms-field__input-wrap${fieldErrors.phone ? " rms-field__input-wrap--error" : ""}`}>
                      <span className="rms-field__icon" aria-hidden="true"><PhoneIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                      <input
                        id="reg-phone"
                        type="tel"
                        autoComplete="tel"
                        className="rms-field__input"
                        value={formData.phone}
                        onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); clearFieldError("phone"); }}
                        aria-describedby={fieldErrors.phone ? "reg-phone-error" : undefined}
                        aria-invalid={!!fieldErrors.phone}
                      />
                    </div>
                    {fieldErrors.phone && <p id="reg-phone-error" className="rms-field__error" role="alert">{fieldErrors.phone}</p>}
                  </div>
                </div>

                <div className="rms-field">
                  <label htmlFor="reg-password" className="rms-field__label">Mật khẩu</label>
                  <div className={`rms-field__input-wrap${fieldErrors.password ? " rms-field__input-wrap--error" : ""}`}>
                    <span className="rms-field__icon" aria-hidden="true"><LockClosedIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                    <input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="rms-field__input rms-field__input--password"
                      value={formData.password}
                      onChange={(e) => { setFormData({ ...formData, password: e.target.value }); clearFieldError("password"); }}
                      aria-describedby={fieldErrors.password ? "reg-password-error" : "reg-pw-strength"}
                      aria-invalid={!!fieldErrors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="rms-field__eye-btn"
                      aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? <EyeIcon className="w-5 h-5" strokeWidth={1.8} /> : <EyeSlashIcon className="w-5 h-5" strokeWidth={1.8} />}
                    </button>
                  </div>
                  {fieldErrors.password && <p id="reg-password-error" className="rms-field__error" role="alert">{fieldErrors.password}</p>}
                  <PasswordStrengthMeter password={formData.password} className="mt-2" />
                </div>

                <div className="rms-field">
                  <label htmlFor="reg-confirm" className="rms-field__label">Nhập lại mật khẩu</label>
                  <div className={`rms-field__input-wrap${fieldErrors.confirmPassword ? " rms-field__input-wrap--error" : ""}`}>
                    <span className="rms-field__icon" aria-hidden="true"><LockClosedIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                    <input
                      id="reg-confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      className="rms-field__input rms-field__input--password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                      aria-describedby={fieldErrors.confirmPassword ? "reg-confirm-error" : undefined}
                      aria-invalid={!!fieldErrors.confirmPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((v) => !v)}
                      className="rms-field__eye-btn"
                      aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showConfirm ? <EyeIcon className="w-5 h-5" strokeWidth={1.8} /> : <EyeSlashIcon className="w-5 h-5" strokeWidth={1.8} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && <p id="reg-confirm-error" className="rms-field__error" role="alert">{fieldErrors.confirmPassword}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="rms-submit-btn" aria-busy={isLoading}>
                  {isLoading ? (
                    <><IconSpinner /><span>Đang xử lý...</span></>
                  ) : (
                    <span>Tạo tài khoản</span>
                  )}
                </button>
              </form>

              <p className="rms-register-link">
                Đã có tài khoản?{" "}
                <Link href="/login" className="rms-register-link__anchor">Đăng nhập ngay</Link>
              </p>
            </>
          )}

          {/* ════════ STEP 2: Nhập OTP Đăng ký ════════ */}
          {step === "otp" && (
            <>
              <div className="rms-form-header">
                <div className="rms-form-header__icon" aria-hidden="true">
                  <ShieldCheckIcon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h1 className="rms-form-header__title">Xác minh Email</h1>
                <p className="rms-form-header__subtitle">{otpMessage}</p>
              </div>

              {success && (
                <div className="rms-alert rms-alert--success" role="alert">
                  <CheckIcon className="w-5 h-5 shrink-0" strokeWidth={2.5} /><span>{success}</span>
                </div>
              )}
              {error && (
                <div className="rms-alert rms-alert--error" role="alert">
                  <XCircleIcon className="w-5 h-5 shrink-0" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleOtpSubmit} noValidate className="rms-form">
                <div className="rms-field">
                  <label htmlFor="otp-code" className="rms-field__label">Mã OTP (6 số)</label>
                  <div className="mt-2">
                    <OtpInput
                      length={6}
                      value={otpCode}
                      onChange={(val) => {
                        setOtpCode(val);
                        if (otpError) setOtpError("");
                      }}
                      error={!!otpError}
                      autoFocus={true}
                    />
                  </div>
                  {otpError && <p id="otp-error" className="rms-field__error" role="alert">{otpError}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="rms-submit-btn" aria-busy={isLoading}>
                  {isLoading ? (
                    <><IconSpinner /><span>Đang xác minh...</span></>
                  ) : (
                    <span>Xác nhận OTP</span>
                  )}
                </button>
              </form>

              <div className="rms-register-link flex flex-col space-y-4">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-sm font-medium text-rms-burgundy hover:underline disabled:opacity-50 transition-opacity"
                >
                  {isResending ? "Đang gửi lại..." : "Chưa nhận được email? Gửi lại mã"}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep("form"); setOtpCode(""); setError(""); setSuccess(""); }}
                  className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                >
                  Quay lại sửa thông tin
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}