"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CakeIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import Sidebar, { NavItem } from "@/components/layout/Sidebar";
import DashboardShell from "@/components/layout/DashboardShell";
import { authService } from "@/features/auth";
import { clearAuthCookies } from "@/utils/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { IconSpinner } from "@/components/common/IconSpinner";

const customerNavItems: NavItem[] = [
  {
    name: "Thực đơn",
    href: "/menu",
    icon: CakeIcon,
  },
  {
    name: "Đặt bàn",
    href: "/reservations",
    icon: CalendarDaysIcon,
  },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isAuthorized } = useRequireAuth(["CUSTOMER"]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {});
      }
      clearAuthCookies();
      localStorage.removeItem("refreshToken");
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isAuthorized === false) {
    return null;
  }

  if (isAuthorized === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <IconSpinner />
      </div>
    );
  }

  return (
    <DashboardShell
      sidebar={
        <Sidebar
          navItems={customerNavItems}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      }
    >
      <div className="max-w-7xl mx-auto w-full">
        {children}
      </div>
    </DashboardShell>
  );
}

