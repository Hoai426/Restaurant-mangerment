import DashboardLayout from "@/components/layout/DashboardLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý đơn hàng | Restaurant Management",
  description: "Trang quản lý đơn hàng",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
