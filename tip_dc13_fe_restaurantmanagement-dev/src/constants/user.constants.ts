import { UserRole } from "@/utils/auth";

export const ROLE_OPTIONS: UserRole[] = ["ADMIN", "STAFF", "CUSTOMER"];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên",
  CUSTOMER: "Khách hàng",
};

/**
 * Returns user-facing Vietnamese display label for a role.
 */
export function getRoleLabel(role?: UserRole | string | null): string {
  if (!role) return "";
  return ROLE_LABELS[role as UserRole] || role;
}

export const ROLE_SELECT_OPTIONS: { value: UserRole; label: string }[] = ROLE_OPTIONS.map(
  (role) => ({
    value: role,
    label: ROLE_LABELS[role],
  })
);

export const STATUS_OPTIONS: { value: boolean; label: string }[] = [
  { value: true, label: "Đang hoạt động" },
  { value: false, label: "Ngừng hoạt động" },
];

/**
 * Returns user-facing Vietnamese display label for active status.
 */
export function getStatusLabel(isActive: boolean): string {
  return isActive ? "Đang hoạt động" : "Ngừng hoạt động";
}
