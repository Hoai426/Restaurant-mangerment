import { getAccessToken } from "@/utils/cookie";

/**
 * Auth utilities for role-based routing.
 *
 * NOTE: userRole cookie is a frontend UX routing hint only.
 * Backend @PreAuthorize annotations remain the final security authority.
 */

export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

/**
 * Return authorization header object for API calls.
 */
export function authHeader(): Record<string, string> {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Decode a JWT payload without any library.
 * Uses atob() to decode the Base64url-encoded payload segment.
 * Returns the parsed payload object, or null if the token is malformed.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Convert Base64url to Base64 before decoding
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Extract the user role from an accessToken JWT.
 *
 * Confirmed from JwtService.java line 36:
 *   .claim("role", role.name())
 * Possible values: "ADMIN" | "STAFF" | "CUSTOMER"
 *
 * Returns null if the token is malformed or contains an unrecognised role.
 */
export function getRoleFromToken(token: string): UserRole | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;
  const role = payload["role"];
  if (role === "ADMIN" || role === "STAFF" || role === "CUSTOMER") {
    return role as UserRole;
  }
  return null;
}

/**
 * Return the correct post-login redirect path based on role.
 * Unknown / null role → /login (never silently grants admin access).
 */
export function getRoleBasedRedirect(role: UserRole | null): string {
  if (role === "ADMIN") return "/dashboard";
  if (role === "STAFF") return "/orders";
  if (role === "CUSTOMER") return "/menu";
  return "/login";
}

/**
 * Clear all auth session cookies and storage (accessToken, refreshToken, userRole, localStorage).
 */
export function clearAuthCookies(): void {
  if (typeof document !== "undefined") {
    const expired = "; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax";
    document.cookie = "accessToken=" + expired;
    document.cookie = "refreshToken=" + expired;
    document.cookie = "userRole=" + expired;
  }
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("refreshToken");
  }
}
