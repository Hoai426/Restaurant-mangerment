import PaymentsClient from "./PaymentsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý thanh toán | Restaurant Management",
  description: "Trang quản lý và tra cứu giao dịch thanh toán",
};

export default function PaymentsPage() {
  return <PaymentsClient />;
}
