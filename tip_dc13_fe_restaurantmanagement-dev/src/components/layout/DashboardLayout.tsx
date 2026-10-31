"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  Squares2X2Icon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TagIcon,
  CakeIcon,
  BuildingOffice2Icon,
  TableCellsIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import { authService } from "@/features/auth";
import { clearAuthCookies } from "@/utils/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Sidebar, { NavItem } from "@/components/layout/Sidebar";
import DashboardShell from "@/components/layout/DashboardShell";

const operationalNavItems: NavItem[] = [
  {
    name: "Tổng quan",
    href: "/dashboard",
    icon: Squares2X2Icon,
    allowedRoles: ["ADMIN"],
  },
  {
    name: "Người dùng",
    href: "/dashboard/users",
    icon: UsersIcon,
    allowedRoles: ["ADMIN"],
  },
  {
    name: "Phòng",
    href: "/dashboard/rooms",
    icon: BuildingOffice2Icon,
    allowedRoles: ["ADMIN"],
  },
  {
    name: "Bàn ăn",
    href: "/dashboard/tables",
    icon: TableCellsIcon,
    allowedRoles: ["ADMIN", "STAFF"],
  },
  {
    name: "Đặt bàn",
    href: "/dashboard/reservations",
    icon: CalendarDaysIcon,
    allowedRoles: ["ADMIN", "STAFF"],
  },
  {
    name: "Đơn hàng",
    href: "/orders",
    icon: ClipboardDocumentListIcon,
    allowedRoles: ["ADMIN", "STAFF"],
  },
  {
    name: "Thanh toán",
    href: "/dashboard/payments",
    icon: BanknotesIcon,
    allowedRoles: ["ADMIN", "STAFF"],
  },
  {
    name: "Báo cáo",
    href: "/dashboard/reports",
    icon: ChartBarIcon,
    allowedRoles: ["ADMIN"],
  },
  {
    name: "Danh mục",
    href: "/menu-management/categories",
    icon: TagIcon,
    allowedRoles: ["ADMIN", "STAFF"],
  },
  {
    name: "Món ăn",
    href: "/menu-management/dishes",
    icon: CakeIcon,
    allowedRoles: ["ADMIN", "STAFF"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { isAuthorized, role } = useRequireAuth(["ADMIN", "STAFF"]);

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

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <IconSpinner />
      </div>
    );
  }

  const visibleNavItems = operationalNavItems.filter((item) => {
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }
    return role ? item.allowedRoles.includes(role) : false;
  });

  return (
    <DashboardShell
      sidebar={
        <Sidebar
          navItems={visibleNavItems}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
        />
      }
    >
      {children}
    </DashboardShell>
  );
}
