"use client";
import React, { useRef, useEffect } from "react";

export interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Convert string value to array of characters
  const otpValues = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const raw = e.target.value;
    const clean = raw.replace(/\D/g, "");
    
    // If empty (because they erased), we handle it
    if (!clean) {
      const newOtpValues = [...otpValues];
      newOtpValues[index] = "";
      onChange(newOtpValues.join(""));
      return;
    }

    // Full OTP autofill (browser / Android keyboard) — fill all boxes at once.
    if (clean.length === length) {
      const next = Array.from({ length }, (_, i) => clean[i]);
      onChange(next.join(""));
      inputRefs.current[length - 1]?.focus();
      return;
    }

    // Single-digit input or Android keyboard accumulation — take only the last character.
    const newDigit = clean.slice(-1);
    const newOtpValues = [...otpValues];
    newOtpValues[index] = newDigit;
    onChange(newOtpValues.join(""));

    // Move to next input
    if (newDigit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        // Current input is empty, move back and clear previous
        const newOtpValues = [...otpValues];
        newOtpValues[index - 1] = "";
        onChange(newOtpValues.join(""));
        inputRefs.current[index - 1]?.focus();
      } else if (otpValues[index]) {
        // Current input has value, clear it
        const newOtpValues = [...otpValues];
        newOtpValues[index] = "";
        onChange(newOtpValues.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pastedData) return;

    const newOtpValues = [...otpValues];
    for (let i = 0; i < pastedData.length; i++) {
      if (i < length) newOtpValues[i] = pastedData[i];
    }
    onChange(newOtpValues.join(""));

    // Focus the next empty input, or the last one
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleFocus = (_index: number, e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="rms-otp-group">
      {otpValues.map((val, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={val}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          onFocus={(e) => handleFocus(index, e)}
          className={`rms-otp-box ${error ? "rms-otp-box--error" : ""}`}
          aria-label={`Digit ${index + 1}`}
        />
      ))}
    </div>
  );
}
