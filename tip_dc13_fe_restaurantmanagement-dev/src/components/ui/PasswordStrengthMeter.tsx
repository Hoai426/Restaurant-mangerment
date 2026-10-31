
import React from "react";
import { getPasswordStrength } from "@/features/users/utils/validation";

export interface PasswordStrengthMeterProps {
  password?: string;
  className?: string;
}

export function PasswordStrengthMeter({ password, className = "" }: PasswordStrengthMeterProps) {
  if (!password) return null;

  const pwStrength = getPasswordStrength(password);

  return (
    <div className={`rms-pw-strength ${className}`} aria-live="polite">
      <div className="rms-pw-strength__bars">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`rms-pw-strength__bar${
              pwStrength.level >= i ? ` rms-pw-strength__bar--level-${pwStrength.level}` : ""
            }`}
          />
        ))}
      </div>
      <span className={`rms-pw-strength__label rms-pw-strength__label--level-${pwStrength.level}`}>
        {pwStrength.label}
      </span>
    </div>
  );
}
