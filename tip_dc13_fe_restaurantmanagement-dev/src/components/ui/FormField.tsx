import React, { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  id?: string;
  required?: boolean;
  icon?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  inputWrapClassName?: string;
}

export function FormField({
  label,
  id,
  required,
  icon,
  error,
  children,
  className = "",
  inputWrapClassName = "",
}: FormFieldProps) {
  return (
    <div className={`rms-field ${className}`}>
      <label htmlFor={id} className="rms-field__label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div
        className={`rms-field__input-wrap relative ${error ? "rms-field__input-wrap--error" : ""} ${inputWrapClassName}`}
      >
        {icon && (
          <span className="rms-field__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && (
        <p id={id ? `err-${id}` : undefined} className="rms-field__error mt-2" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
