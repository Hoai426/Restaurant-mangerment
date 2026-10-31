import React, { useState, forwardRef } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  hasError?: boolean;
  leftIcon?: React.ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className = "", hasError, leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <>
        {leftIcon && (
          <span
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={`rms-field__input pr-12 ${leftIcon ? "!pl-11" : "!pl-4"} ${hasError ? "border-red-500 focus:ring-red-500" : ""
            } ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          tabIndex={-1}
          aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
        >
          {showPassword ? (
            <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <EyeIcon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </>
    );
  }
);

PasswordInput.displayName = "PasswordInput";
