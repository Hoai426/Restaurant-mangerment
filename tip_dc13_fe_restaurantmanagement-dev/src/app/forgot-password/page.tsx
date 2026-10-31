import type { Metadata } from "next";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Quên mật khẩu | Restaurant Management",
  description: "Khôi phục mật khẩu tài khoản quản lý nhà hàng",
};

export default function ForgotPasswordPage() {
  return (
    <main className="rms-login-page">
      <ForgotPasswordForm />
    </main>
  );
}