import type { Metadata } from "next";
import { DishListPage } from "@/features/dishes";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Quản lý món ăn | Restaurant Management",
  description: "Danh sách và chi tiết món ăn trong thực đơn của nhà hàng",
};

export default function DishesPage() {
  return <DishListPage />;
}
