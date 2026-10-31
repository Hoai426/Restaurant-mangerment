import type { Metadata } from "next";
import MenuClient from "./MenuClient";

export const metadata: Metadata = {
  title: "Gọi món | Restaurant Management",
  description: "Trang gọi món - Chức năng đang được phát triển",
};

export default function MenuPage() {
  return <MenuClient />;
}
