import ClientLayout from "@/components/layout/ClientLayout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thực đơn | Restaurant Management",
  description: "Gọi món trực tuyến",
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
