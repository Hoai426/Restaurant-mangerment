/**
 * Đọc giá trị cookie theo tên.
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|;\\s*)" + name + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Lấy access token từ cookie.
 */
export function getAccessToken(): string | null {
  return getCookie("accessToken");
}

/**
 * Lưu cookie an toàn trên môi trường trình duyệt.
 */
export function setCookie(
  name: string,
  value: string,
  maxAgeSeconds: number
): void {
  if (typeof document === "undefined") return;
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

/**
 * Lấy refresh token từ cookie hoặc fallback sang localStorage.
 */
export function getRefreshToken(): string | null {
  if (typeof document !== "undefined") {
    const fromCookie = getCookie("refreshToken");
    if (fromCookie) return fromCookie;
  }
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("refreshToken");
  }
  return null;
}

