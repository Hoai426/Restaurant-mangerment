import { NextRequest, NextResponse } from "next/server";

/**
 * Decode a JWT payload in the Edge Runtime (no crypto/verify — payload read only).
 * Returns the parsed claims object, or null if the token is structurally invalid.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    // Base64url → Base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    // atob is available in the Next.js Edge Runtime
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr) as Record<string, unknown>;
  } catch {
    return null;
  }
}

type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

function extractRoleFromPayload(
  payload: Record<string, unknown> | null
): UserRole | null {
  if (!payload) return null;
  const role = payload["role"];
  if (role === "ADMIN" || role === "STAFF" || role === "CUSTOMER") {
    return role as UserRole;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nowSeconds = Math.floor(Date.now() / 1000);

  const accessToken = request.cookies.get("accessToken")?.value ?? "";
  const refreshToken = request.cookies.get("refreshToken")?.value ?? "";

  const accessPayload = accessToken ? decodeJwtPayload(accessToken) : null;
  const accessExp =
    typeof accessPayload?.["exp"] === "number" ? accessPayload["exp"] : 0;
  const isAccessValid = !!accessPayload && accessExp > nowSeconds;

  let resolvedRole: UserRole | null = extractRoleFromPayload(accessPayload);

  // Fallback đọc role từ userRole cookie nếu payload token không có
  if (!resolvedRole) {
    const roleCookie = request.cookies.get("userRole")?.value;
    if (
      roleCookie === "ADMIN" ||
      roleCookie === "STAFF" ||
      roleCookie === "CUSTOMER"
    ) {
      resolvedRole = roleCookie as UserRole;
    }
  }

  // CASE 1: accessToken còn hạn hợp lệ -> Tiếp tục kiểm tra phân quyền
  if (isAccessValid) {
    // access token is valid
  } else if (refreshToken) {
    // CASE 2: accessToken hết hạn hoặc không có, NHƯNG refreshToken cookie còn tồn tại
    const refreshPayload = decodeJwtPayload(refreshToken);

    // CASE 4: Nếu refreshToken là JWT và đã hết hạn rõ ràng
    if (
      refreshPayload &&
      typeof refreshPayload["exp"] === "number" &&
      refreshPayload["exp"] <= nowSeconds
    ) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // CASE 5: refreshToken là opaque token hoặc JWT còn hạn:
    // KHÔNG redirect /login. Cho phép trang client nạp lên,
    // Axios Interceptor sẽ nhận 401 ở API đầu tiên và tự động gọi /auth/refresh.
    if (!resolvedRole) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  } else {
    // CASE 3: Không có accessToken và không có refreshToken -> redirect /login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!resolvedRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = resolvedRole;

  if (pathname.startsWith("/dashboard")) {
    // All authenticated users can access their profile
    if (pathname === "/dashboard/profile") {
      return NextResponse.next();
    }

    // STAFF can access tables, reservations, and payments management
    if (
      role === "STAFF" &&
      (pathname.startsWith("/dashboard/tables") ||
        pathname.startsWith("/dashboard/reservations") ||
        pathname.startsWith("/dashboard/payments"))
    ) {
      return NextResponse.next();
    }

    if (role !== "ADMIN") {
      // Redirect unauthorized users to their default landing route
      const redirectPath = role === "STAFF" ? "/orders" : "/menu";
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    return NextResponse.next();
  }

  if (pathname === "/menu") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (role === "STAFF") {
      return NextResponse.redirect(new URL("/orders", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/reservations")) {
    if (role === "ADMIN") {
      // ADMIN is redirected back to dashboard tables
      return NextResponse.redirect(new URL("/dashboard/tables", request.url));
    }
    if (role === "STAFF") {
      // STAFF is redirected to internal reservations dashboard
      return NextResponse.redirect(
        new URL("/dashboard/reservations", request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Run only on protected routes.
   * Public routes (/login, /register, /forgot-password, /) are never intercepted.
   */
  matcher: ["/dashboard/:path*", "/menu", "/reservations/:path*"],
};
