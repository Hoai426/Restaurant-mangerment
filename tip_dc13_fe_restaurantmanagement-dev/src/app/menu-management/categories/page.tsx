import type { Metadata } from "next";
import { CategoryListPage } from "@/features/categories";

export const metadata: Metadata = {
  title: "Danh mục món ăn | Restaurant Management",
  description: "Danh sách danh mục món ăn trong thực đơn của nhà hàng",
};

export default function CategoriesPage() {
  return <CategoryListPage />;
}
