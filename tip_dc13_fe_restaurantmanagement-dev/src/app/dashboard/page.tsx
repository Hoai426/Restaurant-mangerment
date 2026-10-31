import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | Restaurant Management",
  description: "Tổng quan hệ thống quản lý nhà hàng",
};

export default function DashboardPage() {
  return <DashboardClient />;
}