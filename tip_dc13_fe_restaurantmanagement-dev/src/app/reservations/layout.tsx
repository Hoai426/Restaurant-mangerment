import ClientLayout from "@/components/layout/ClientLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt bàn trực tuyến | Restaurant Management",
  description: "Đặt bàn trực tuyến dành cho khách hàng",
};

export default function ReservationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
