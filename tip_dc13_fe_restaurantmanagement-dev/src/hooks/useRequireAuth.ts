import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/utils/cookie";
import { getRoleFromToken, getRoleBasedRedirect, UserRole } from "@/utils/auth";

export interface AuthState {
  isAuthorized: boolean | null;
  role: UserRole | null;
}

/**
 * Checks if the user is authenticated and optionally checks if they have an allowed role.
 * Automatically handles redirection if unauthorized, following existing routing conventions.
 *
 * @param allowedRoles Array of allowed UserRoles. If empty/undefined, any authenticated user is allowed.
 * @returns AuthState containing isAuthorized flag and the user's role. `isAuthorized` is null while checking.
 */
export function useRequireAuth(allowedRoles?: UserRole[]): AuthState {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthorized: null,
    role: null,
  });

  useEffect(() => {
    const token = getAccessToken();
    
    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAuthState({ isAuthorized: false, role: null });
      router.push("/login");
      return;
    }

    const role = getRoleFromToken(token);
    
    if (!role) {
      setAuthState({ isAuthorized: false, role: null });
      router.push("/login");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      setAuthState({ isAuthorized: false, role });
      // Redirect to their default dashboard/menu based on role
      router.push(getRoleBasedRedirect(role));
      return;
    }

    setAuthState({ isAuthorized: true, role });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, allowedRoles ? allowedRoles.join(",") : ""]);

  return authState;
}
