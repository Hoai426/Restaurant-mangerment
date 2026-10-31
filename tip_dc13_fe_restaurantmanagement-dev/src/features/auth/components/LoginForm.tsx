"use client";
import { useState } from "react";
import Link from "next/link";
import { authService } from "@/features/auth";
import { getRoleFromToken, getRoleBasedRedirect } from "@/utils/auth";
import { setCookie } from "@/utils/cookie";
import type { LoginRequest } from "@/types/auth";
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon, 
  CheckIcon,
  XCircleIcon,
  BuildingStorefrontIcon,
  Square3Stack3DIcon
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";




import { AuthBranding } from "./AuthBranding";
import { AUTH_BRANDING_CONTENT } from "../constants/auth.constants";

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginRequest>({ identifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateCredentials = () => {
    const errs = { identifier: "", password: "" };
    if (!formData.identifier.trim()) errs.identifier = "Vui lòng nhập tên đăng nhập hoặc email";
    if (!formData.password) errs.password = "Mật khẩu không được để trống";
    setFieldErrors(errs);
    return !errs.identifier && !errs.password;
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!validateCredentials()) return;
    setIsLoading(true);
    try {
      const result = await authService.login({
        identifier: formData.identifier,
        password: formData.password,
        rememberMe,
      });

      const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 ngày hoặc 1 ngày
      const role = getRoleFromToken(result.accessToken);

      setCookie("accessToken", result.accessToken, maxAge);
      setCookie("refreshToken", result.refreshToken, maxAge);
      setCookie("userRole", role || "", maxAge);
      localStorage.setItem("refreshToken", result.refreshToken);

      setSuccess("Đăng nhập thành công!");
      setTimeout(() => {
        window.location.href = getRoleBasedRedirect(role);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: "identifier" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="rms-login-wrapper">
      <AuthBranding
        imageSrc="/restaurant-bg.jpg"
        imageAlt="Restaurant interior"
        icon={<BuildingStorefrontIcon className="w-8 h-8" strokeWidth={1.5} />}
        slogan={AUTH_BRANDING_CONTENT.slogan}
        description={AUTH_BRANDING_CONTENT.description}
        features={AUTH_BRANDING_CONTENT.features}
      />
      <div className="rms-form-section">
        <div className="rms-form-container">
          <div className="rms-form-header">
            <div className="rms-form-header__icon" aria-hidden="true">
              <Square3Stack3DIcon className="w-7 h-7" strokeWidth={1.5} />
            </div>
            <h1 className="rms-form-header__title">Chào mừng trở lại</h1>
            <p className="rms-form-header__subtitle">Đăng nhập để tiếp tục quản lý nhà hàng</p>
          </div>
          {success && <div className="rms-alert rms-alert--success" role="alert"><CheckIcon className="w-5 h-5 shrink-0" strokeWidth={2.5} /><span>{success}</span></div>}
          {error && (
            <div className="rms-alert rms-alert--error" role="alert">
              <XCircleIcon className="w-5 h-5 shrink-0" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleCredentialsSubmit} noValidate className="rms-form">
            <div className="rms-field">
              <label htmlFor="login-identifier" className="rms-field__label">Tên đăng nhập hoặc Email</label>
              <div className={`rms-field__input-wrap${fieldErrors.identifier ? " rms-field__input-wrap--error" : ""}`}>
                <span className="rms-field__icon" aria-hidden="true"><UserIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                <input id="login-identifier" type="text" autoComplete="username" className="rms-field__input" value={formData.identifier} onChange={(e) => handleFieldChange("identifier", e.target.value)} aria-invalid={!!fieldErrors.identifier} />
              </div>
              {fieldErrors.identifier && <p id="identifier-error" className="rms-field__error" role="alert">{fieldErrors.identifier}</p>}
            </div>
            <div className="rms-field">
              <div className="rms-field__label-row">
                <label htmlFor="login-password" className="rms-field__label">Mật khẩu</label>
                <Link href="/forgot-password" className="rms-forgot-link">Quên mật khẩu?</Link>
              </div>
              <div className={`rms-field__input-wrap${fieldErrors.password ? " rms-field__input-wrap--error" : ""}`}>
                <span className="rms-field__icon" aria-hidden="true"><LockClosedIcon className="w-5 h-5" strokeWidth={1.8} /></span>
                <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="rms-field__input rms-field__input--password" value={formData.password} onChange={(e) => handleFieldChange("password", e.target.value)} aria-invalid={!!fieldErrors.password} />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="rms-field__eye-btn" aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>{showPassword ? <EyeIcon className="w-5 h-5" strokeWidth={1.8} /> : <EyeSlashIcon className="w-5 h-5" strokeWidth={1.8} />}</button>
              </div>
              {fieldErrors.password && <p id="password-error" className="rms-field__error" role="alert">{fieldErrors.password}</p>}
            </div>
            <div className="rms-remember-row">
              <label className="rms-remember-label" htmlFor="remember-me">
                <input id="remember-me" type="checkbox" className="rms-remember-checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span className="rms-remember-custom" aria-hidden="true">{rememberMe && <CheckIcon className="w-4 h-4 shrink-0" strokeWidth={2.5} />}</span>
                <span className="rms-remember-text">Ghi nhớ đăng nhập</span>
              </label>
            </div>
            <button type="submit" disabled={isLoading} className="rms-submit-btn" aria-busy={isLoading}>
              {isLoading ? (<><IconSpinner /><span>Đang xử lý...</span></>) : (<span>Đăng nhập</span>)}
            </button>
          </form>
          <p className="rms-register-link">Chưa có tài khoản? <Link href="/register" className="rms-register-link__anchor">Đăng ký ngay</Link></p>
        </div>
      </div>
    </div>
  );
}