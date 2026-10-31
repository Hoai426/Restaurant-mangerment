import type { Metadata } from "next";
import RegisterForm from "@/features/auth/components/RegisterForm";

export const metadata: Metadata = {
  title: "Đăng ký | Restaurant Management",
  description: "Tạo tài khoản để bắt đầu quản lý nhà hàng của bạn",
};

export default function RegisterPage() {
  return (
    <main className="rms-login-page">
      <RegisterForm />
    </main>
  );
}