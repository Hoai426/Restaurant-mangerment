import type { Metadata } from "next";
import UserCreatePage from "@/features/users/components/UserCreatePage";

export const metadata: Metadata = {
  title: "Thêm người dùng | Restaurant Management",
  description: "Tạo người dùng mới trong hệ thống quản lý nhà hàng",
};

export default function CreateUserRoute() {
  return <UserCreatePage />;
}
