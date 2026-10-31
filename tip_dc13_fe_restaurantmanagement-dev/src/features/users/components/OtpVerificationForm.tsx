"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { Alert } from "@/components/ui/Alert";

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 60;

interface OtpInputGroupProps {
  digits: string[];
  isError: boolean;
  isShaking: boolean;
  disabled: boolean;
  inputIdPrefix: string;
  inputRefs: React.RefObject<(HTMLInputElement | null)[]>;
  onChange: (index: number, value: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
}

function OtpInputGroup({
  digits,
  isError,
  isShaking,
  disabled,
  inputIdPrefix,
  inputRefs,
  onChange,
  onKeyDown,
  onPaste,
}: OtpInputGroupProps) {
  return (
    <div
      className={`rms-otp-group${isShaking ? " rms-otp-group--shake" : ""}`}
      role="group"
      aria-label="Enter the 6-digit OTP code"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            if (inputRefs.current) inputRefs.current[index] = el;
          }}
          id={`${inputIdPrefix}-${index}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          className={`rms-otp-box${isError ? " rms-otp-box--error" : ""}${
            digit ? " scale-105" : ""
          }`}
          style={{
            transition:
              "transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease",
          }}
          onChange={(e) => onChange(index, e.target.value)}
          onKeyDown={(e) => onKeyDown(index, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

export interface OtpVerificationFormProps {
  /** Email address displayed as the OTP destination. */
  email: string;

  /** Prefix for input element IDs — ensures uniqueness when multiple OTP forms co-exist. */
  inputIdPrefix: string;

  
  title: string;
  subtitle?: string;
  submitLabel: string;
  submitLoadingLabel?: string;

  
  isVerifyPending: boolean;
  verifyError: string;
  onVerify: (otpCode: string) => void;

  
  isResendPending: boolean;
  resendError: string;
  onResend: () => void;

  
  onBack: () => void;

  
  clearVerifyError: () => void;
  clearResendError: () => void;
}

export default function OtpVerificationForm({
  email,
  inputIdPrefix,
  title,
  subtitle,
  submitLabel,
  submitLoadingLabel = "Đang xác thực...",
  isVerifyPending,
  verifyError,
  onVerify,
  isResendPending,
  resendError,
  onResend,
  onBack,
  clearVerifyError,
  clearResendError,
}: OtpVerificationFormProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [isShaking, setIsShaking] = useState(false);
  const [localError, setLocalError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(OTP_LENGTH).fill(null)
  );

  const canResend = countdown <= 0;
  const otpCode = digits.join("");
  const isComplete = otpCode.length === OTP_LENGTH;
  const isPending = isVerifyPending || isResendPending;

  // Countdown timer — restarts whenever `countdown` goes above 0.
  useEffect(() => {
    if (countdown <= 0) return;

    const id = window.setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(id);
  }, [countdown]);

  // Focus first input on mount.
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const triggerShake = useCallback(() => {
    setIsShaking(true);
    const t = window.setTimeout(() => setIsShaking(false), 450);
    return () => clearTimeout(t);
  }, []);

  // Trigger shake animation whenever a new verify error arrives.
  const prevVerifyErrorRef = useRef("");
  useEffect(() => {
    if (verifyError && verifyError !== prevVerifyErrorRef.current) {
      triggerShake();
    }
    prevVerifyErrorRef.current = verifyError;
  }, [verifyError, triggerShake]);

  const focusBox = (index: number) => {
    const clamped = Math.max(0, Math.min(OTP_LENGTH - 1, index));
    inputRefs.current[clamped]?.focus();
  };

  const clearErrors = () => {
    setLocalError("");
    if (verifyError) clearVerifyError();
    if (resendError) clearResendError();
  };

  const handleChange = (index: number, raw: string) => {
    const clean = raw.replace(/\D/g, "");
    if (!clean) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }

    // Full OTP autofill (browser / Android keyboard) — fill all boxes at once.
    if (clean.length === OTP_LENGTH) {
      const next = Array.from({ length: OTP_LENGTH }, (_, i) => clean[i]);
      setDigits(next);
      clearErrors();
      focusBox(OTP_LENGTH - 1);
      return;
    }

    // Single-digit input or Android keyboard accumulation — take only the last character.
    const newDigit = clean.slice(-1);
    const next = [...digits];
    next[index] = newDigit;
    setDigits(next);
    clearErrors();

    if (index < OTP_LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
        focusBox(index - 1);
      }
      clearErrors();
    } else if (e.key === "Delete") {
      e.preventDefault();
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
        clearErrors();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      focusBox(index + 1);
    } else if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) {
      next[i] = pasted[i];
    }
    setDigits(next);
    clearErrors();

    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    window.setTimeout(() => focusBox(lastFilled), 0);
  };

  const handleSubmit = () => {
    if (isPending) return;
    if (!isComplete) {
      setLocalError("Vui lòng nhập đủ 6 chữ số.");
      triggerShake();
      return;
    }
    // Wrapper's onVerify is responsible for calling the hook and showing success.
    onVerify(otpCode);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleResend = () => {
    setDigits(Array(OTP_LENGTH).fill(""));
    setCountdown(COUNTDOWN_SECONDS);
    clearErrors();
    onResend();
    window.setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const displayError = localError || verifyError;
  const hasError = !!displayError;

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden w-full max-w-lg mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="px-6 sm:px-8 py-4 border-b border-gray-100 flex items-center gap-3.5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm flex-shrink-0">
          <div className="h-full w-full bg-white rounded-xl flex items-center justify-center text-rms-charcoal">
            <EnvelopeIcon className="w-5 h-5" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-rms-charcoal">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-6 sm:px-8 py-6">
        <p className="text-sm text-gray-600 mb-6 leading-relaxed text-center">
          Mã xác thực 6 chữ số đã được gửi đến{" "}
          <span className="font-semibold text-rms-burgundy break-all">
            {email}
          </span>
          . Mã có hiệu lực trong 5 phút.
        </p>

        {/* Resend error banner — shown separately from the OTP field error */}
        <Alert type="error" message={resendError} />

        <form onSubmit={handleFormSubmit} noValidate>
          <OtpInputGroup
            digits={digits}
            isError={hasError}
            isShaking={isShaking}
            disabled={isPending}
            inputIdPrefix={inputIdPrefix}
            inputRefs={inputRefs}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />

          {displayError && (
            <p
              id={`err-${inputIdPrefix}`}
              className="rms-field__error justify-center mt-2"
              role="alert"
            >
              {displayError}
            </p>
          )}

          {/* Countdown & Resend */}
          <div className="rms-otp-countdown mt-4">
            <span>Không nhận được mã?</span>
            {canResend ? (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResendPending}
                className="rms-otp-resend font-medium text-rms-burgundy hover:underline"
              >
                {isResendPending ? "Đang gửi..." : "Gửi lại"}
              </button>
            ) : (
              <span className="ml-1 text-gray-500">
                Gửi lại sau{" "}
                <span className="font-semibold text-rms-charcoal tabular-nums">
                  {countdown}s
                </span>
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 mt-5 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onBack}
              disabled={isPending}
              title="Quay lại"
              aria-label="Quay lại"
              className="h-10 px-4 inline-flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:text-rms-burgundy hover:bg-gray-50 hover:border-rms-burgundy/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1.5" strokeWidth={2} />
              <span className="text-sm font-medium">Quay lại</span>
            </button>

            <button
              type="submit"
              disabled={isPending || !isComplete}
              className="rms-submit-btn w-auto min-w-44 mt-0 !py-2.5 whitespace-nowrap"
              aria-busy={isVerifyPending}
            >
              {isVerifyPending ? (
                <>
                  <IconSpinner />
                  <span>{submitLoadingLabel}</span>
                </>
              ) : (
                <span>{submitLabel}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

