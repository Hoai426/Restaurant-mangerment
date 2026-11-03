import Link from "next/link";
import {
  BuildingStorefrontIcon,
  SparklesIcon,
  BookOpenIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-radial from-[#FFFDF9] via-[#F8F5EF] to-[#EDE7DB] px-4 py-8 text-rms-charcoal">
      <div className="max-w-lg w-full rounded-3xl bg-white/90 backdrop-blur-md border border-[#E2D9CC] p-8 sm:p-10 text-center shadow-xl shadow-rms-burgundy/5 animate-fade-in-up">
        {/* Brand Badge */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rms-burgundy text-white shadow-lg shadow-rms-burgundy/20">
          <BuildingStorefrontIcon className="w-9 h-9 text-rms-gold" strokeWidth={1.8} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rms-gold/10 text-rms-gold text-xs font-bold tracking-wider uppercase mb-3 border border-rms-gold/20">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Hệ Thống Nhà Hàng Cao Cấp</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rms-charcoal">
          Restaurant Management
        </h1>
        <p className="mt-2.5 text-sm sm:text-base text-rms-text-secondary max-w-sm mx-auto leading-relaxed">
          Giải pháp quản lý bàn ăn, thực đơn, đơn hàng và doanh thu vận hành chuẩn xác, tinh tế.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-rms-gradient px-5 py-3.5 font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-rms-burgundy/25 hover:-translate-y-0.5 cursor-pointer text-sm"
          >
            <span>Đăng nhập hệ thống</span>
            <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <Link
              href="/menu"
              className="flex items-center justify-center gap-1.5 rounded-xl bg-rms-cream hover:bg-[#F0EAE0] px-4 py-3 font-semibold text-rms-charcoal border border-rms-border transition-colors text-sm cursor-pointer"
            >
              <BookOpenIcon className="w-4 h-4 text-rms-gold" />
              <span>Xem thực đơn</span>
            </Link>

            <Link
              href="/register"
              className="flex items-center justify-center rounded-xl bg-white hover:bg-gray-50 px-4 py-3 font-semibold text-rms-text-secondary border border-gray-200 transition-colors text-sm cursor-pointer"
            >
              <span>Đăng ký mới</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-rms-text-muted">
          <span>&copy; {new Date().getFullYear()} Restaurant Management System</span>
        </div>
      </div>
    </main>
  );
}
