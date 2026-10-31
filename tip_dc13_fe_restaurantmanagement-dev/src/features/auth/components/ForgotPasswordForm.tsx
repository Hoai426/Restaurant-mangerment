"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OtpInput } from "@/components/ui/OtpInput";
import { authService } from "@/features/auth/services/auth.service";
import { 
  EnvelopeIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CheckIcon,
  ShieldCheckIcon,
  KeyIcon,
  XCircleIcon
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";

import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { AuthBranding } from "./AuthBranding";

export default function ForgotPasswordForm() {
  const router = useRouter();

  type Step = "email" | "otp" | "reset";
  const [step, setStep] = useState<Step>("email");
  
  const [email, setEmail] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [otpShake, setOtpShake] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0 && !otpSuccess) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown, otpSuccess]);


  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stepMessage, setStepMessage] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    email: "", otpCode: "", newPassword: "", confirmPassword: ""
  });

  const clearFieldError = (field: keyof typeof fieldErrors) => {
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (!email.trim()) {
      setFieldErrors(prev => ({ ...prev, email: "Vui lòng nhập email của bạn" }));
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldErrors(prev => ({ ...prev, email: "Email không hợp lệ" }));
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.forgotPassword({ email });
      setTempToken(result.tempToken);
      setStepMessage(result.message || `Mã OTP đã được gửi đến email ${email}`);
      setStep("otp");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setError("");
    try {
      const result = await authService.forgotPassword({ email });
      setTempToken(result.tempToken);
      setStepMessage("Mã OTP mới đã được gửi.");
      setCountdown(60);
      setOtpCode("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!otpCode.trim() || otpCode.length < 6) {
      setFieldErrors(prev => ({ ...prev, otpCode: "Vui lòng nhập đủ 6 số OTP" }));
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.verifyForgotPasswordOtp({ tempToken, otpCode });
      setResetToken(result.resetToken);
      setOtpSuccess(true);
      setTimeout(() => {
        setOtpSuccess(false);
        setStepMessage("Xác thực thành công. Vui lòng tạo mật khẩu mới.");
        setStep("reset");
      }, 700);
    } catch (err: unknown) {
      setOtpShake(true);
      setTimeout(() => setOtpShake(false), 400);
      let errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi";
      if (errorMessage.toLowerCase().includes("otp") || errorMessage.toLowerCase().includes("mã")) {
        errorMessage = "Mã OTP không đúng. Vui lòng kiểm tra lại!";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const errs = { ...fieldErrors, newPassword: "", confirmPassword: "" };
    if (!newPassword) errs.newPassword = "Mật khẩu mới không được để trống";
    if (!confirmPassword) {
      errs.confirmPassword = "Vui lòng nhập lại mật khẩu";
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Mật khẩu không khớp";
    }

    if (errs.newPassword || errs.confirmPassword) {
      setFieldErrors(errs);
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({ resetToken, newPassword });
      setSuccess("Đổi mật khẩu thành công! Đang chuyển hướng...");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="rms-login-wrapper">
      <AuthBranding
        imageSrc="/restaurant-bg.jpg"
        imageAlt="Restaurant interior"
        icon={<KeyIcon className="w-7 h-7" strokeWidth={1.5} />}
        slogan="Khôi phục truy cập hệ thống"
        description="Bảo mật tuyệt đối, khôi phục mật khẩu dễ dàng qua email."
      />
      
      <div className="rms-form-section">
        <div className="rms-form-container">

          {/* ======================= STEP 1: Nhập Email ======================= */}
          {step === "email" && (
            <div className="animate-fade-in-up">
              <div className="rms-form-header">
                <div className="rms-form-header__icon animate-scale-in" aria-hidden="true">
                  <KeyIcon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h1 className="rms-form-header__title delay-100 animate-fade-in-up">Quên mật khẩu?</h1>
                <p className="rms-form-header__subtitle delay-200 animate-fade-in-up">
                  Nhập email đăng ký của bạn để nhận mã khôi phục
                </p>
              </div>

              {error && (
                <div className="rms-alert rms-alert--error delay-200 animate-fade-in-up" role="alert">
                  <XCircleIcon className="w-5 h-5 shrink-0" strokeWidth={2} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleEmailSubmit} noValidate className="rms-form delay-300 animate-fade-in-up">
                <div className="rms-field">
                  <label htmlFor="email" className="rms-field__label">Email</label>
                  <div className={`rms-field__input-wrap${fieldErrors.email ? " rms-field__input-wrap--error" : ""}`}>
                    <span className="rms-field__icon" aria-hidden="true"><EnvelopeIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="rms-field__input"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
                      autoFocus
                      aria-describedby={fieldErrors.email ? "email-error" : undefined}
                      aria-invalid={!!fieldErrors.email}
                    />
                  </div>
                  {fieldErrors.email && <p id="email-error" className="rms-field__error" role="alert">{fieldErrors.email}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="rms-submit-btn" aria-busy={isLoading}>
                  {isLoading ? (
                    <><IconSpinner /><span>Đang xử lý...</span></>
                  ) : (
                    <span>Nhận mã khôi phục</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ======================= STEP 2: Nhập OTP ======================= */}
          {step === "otp" && (
            <div className="animate-fade-in-up">
              <div className="rms-form-header">
                <div className="rms-form-header__icon animate-scale-in" aria-hidden="true">
                  {otpSuccess ? <CheckIcon className="rms-otp-success-icon" /> : <ShieldCheckIcon className="w-7 h-7" strokeWidth={1.5} />}
                </div>
                <h1 className="rms-form-header__title delay-100 animate-fade-in-up">
                  {otpSuccess ? "Xác minh thành công" : "Xác minh mã OTP"}
                </h1>
                <p className="rms-form-header__subtitle delay-200 animate-fade-in-up">
                  {otpSuccess ? "Đang chuyển đến trang đặt lại mật khẩu..." : stepMessage}
                </p>
              </div>

              {!otpSuccess && (
                <>
                  {error && (
                    <div className="rms-alert rms-alert--error delay-200 animate-fade-in-up" role="alert">
                      <XCircleIcon className="w-5 h-5 shrink-0" strokeWidth={2} />
                      <span>{error}</span>
                    </div>
                  )}

                  <form onSubmit={handleOtpSubmit} noValidate className="rms-form delay-300 animate-fade-in-up">
                    <div className="rms-field">
                      <label className="rms-field__label text-center">Mã OTP (6 số)</label>
                      <div className={otpShake ? 'rms-otp-group--shake' : ''}>
                        <OtpInput
                          length={6}
                          value={otpCode}
                          onChange={(val) => {
                            setOtpCode(val);
                            clearFieldError("otpCode");
                          }}
                          error={!!fieldErrors.otpCode}
                          autoFocus={true}
                        />
                      </div>
                      {fieldErrors.otpCode && <p className="rms-field__error text-center" role="alert">{fieldErrors.otpCode}</p>}
                    </div>
                    
                    <div className="rms-otp-countdown">
                      {countdown > 0 ? (
                        <span>Gửi lại mã sau {countdown}s</span>
                      ) : (
                        <span>
                          Không nhận được mã? 
                          <button type="button" className="rms-otp-resend" onClick={handleResendOtp} disabled={isLoading}>
                            Gửi lại mã OTP
                          </button>
                        </span>
                      )}
                    </div>

                    <button type="submit" disabled={isLoading || otpCode.length < 6} className="rms-submit-btn" aria-busy={isLoading}>
                      {isLoading ? (
                        <><IconSpinner /><span>Đang xác minh...</span></>
                      ) : (
                        <span>Xác nhận OTP</span>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

          {/* ======================= STEP 3: Đặt lại Mật khẩu ======================= */}
          {step === "reset" && (
            <>
              <div className="rms-form-header">
                <div className="rms-form-header__icon" aria-hidden="true">
                  <KeyIcon className="w-7 h-7" strokeWidth={1.5} />
                </div>
                <h1 className="rms-form-header__title">Tạo mật khẩu mới</h1>
                <p className="rms-form-header__subtitle">{stepMessage}</p>
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

              <form onSubmit={handleResetSubmit} noValidate className="rms-form">
                <div className="rms-field">
                  <label htmlFor="new-password" className="rms-field__label">Mật khẩu mới</label>
                  <div className={`rms-field__input-wrap${fieldErrors.newPassword ? " rms-field__input-wrap--error" : ""}`}>
                    <span className="rms-field__icon" aria-hidden="true"><LockClosedIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      className="rms-field__input rms-field__input--password"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); clearFieldError("newPassword"); }}
                      aria-describedby={fieldErrors.newPassword ? "new-pw-error" : "reset-pw-strength"}
                      aria-invalid={!!fieldErrors.newPassword}
                      autoFocus
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
                  {fieldErrors.newPassword && <p id="new-pw-error" className="rms-field__error" role="alert">{fieldErrors.newPassword}</p>}
                  <PasswordStrengthMeter password={newPassword} className="mt-2" />
                </div>

                <div className="rms-field">
                  <label htmlFor="confirm-password" className="rms-field__label">Nhập lại mật khẩu mới</label>
                  <div className={`rms-field__input-wrap${fieldErrors.confirmPassword ? " rms-field__input-wrap--error" : ""}`}>
                    <span className="rms-field__icon" aria-hidden="true"><LockClosedIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                    <input
                      id="confirm-password"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      className="rms-field__input rms-field__input--password"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError("confirmPassword"); }}
                      aria-describedby={fieldErrors.confirmPassword ? "confirm-pw-error" : undefined}
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
                  {fieldErrors.confirmPassword && <p id="confirm-pw-error" className="rms-field__error" role="alert">{fieldErrors.confirmPassword}</p>}
                </div>

                <button type="submit" disabled={isLoading} className="rms-submit-btn" aria-busy={isLoading}>
                  {isLoading ? (
                    <><IconSpinner /><span>Đang xử lý...</span></>
                  ) : (
                    <span>Lưu mật khẩu & Đăng nhập</span>
                  )}
                </button>
              </form>
            </>
          )}

          <p className="rms-register-link">
            <Link href="/login" className="rms-register-link__anchor">
              &larr; Quay lại trang Đăng nhập
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
