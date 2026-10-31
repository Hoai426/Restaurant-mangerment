import React, { ReactNode } from "react";

export type BadgeVariant =
  | "active"
  | "inactive"
  | "role"
  | "neutral"
  | "warning"
  | "info";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_CLASS_MAP: Record<BadgeVariant, string> = {
  active: "rms-badge--active",
  inactive: "rms-badge--inactive",
  role: "rms-badge--role",
  neutral: "bg-gray-100 text-gray-700 border border-gray-200",
  warning: "bg-amber-50 text-amber-800 border border-amber-200",
  info: "bg-blue-50 text-blue-800 border border-blue-200",
};

export function Badge({
  variant = "neutral",
  children,
  className = "",
}: BadgeProps) {
  const variantClass = VARIANT_CLASS_MAP[variant] || "";

  return (
    <span className={`rms-badge ${variantClass} ${className}`}>
      {children}
    </span>
  );
}

export interface StatusBadgeProps {
  isActive: boolean;
  activeText?: string;
  inactiveText?: string;
  className?: string;
}

export function StatusBadge({
  isActive,
  activeText = "Đang hoạt động",
  inactiveText = "Tạm ngưng",
  className = "",
}: StatusBadgeProps) {
  return (
    <Badge
      variant={isActive ? "active" : "inactive"}
      className={className}
    >
      {isActive ? activeText : inactiveText}
    </Badge>
  );
}

export default Badge;
