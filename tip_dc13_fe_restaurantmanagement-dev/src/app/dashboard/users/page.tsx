import type { Metadata } from "next";
import UserListPage from "@/features/users/components/UserListPage";

export const metadata: Metadata = {
  title: "Quản lý người dùng | Restaurant Management",
  description: "Danh sách người dùng trong hệ thống quản lý nhà hàng",
};

export default function UsersPage() {
  return <UserListPage />;
}
