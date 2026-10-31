import type { Metadata } from "next";
import LoginForm from "@/features/auth/components/LoginForm";

export const metadata: Metadata = {
  title: "Đăng nhập | Restaurant Management",
  description: "Đăng nhập vào hệ thống quản lý nhà hàng của bạn",
};

export default function LoginPage() {
  return (
    <main className="rms-login-page">
      <LoginForm />
    </main>
  );
}