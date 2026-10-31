import Link from "next/link";
import { BuildingStorefrontIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-white">
      <div className="max-w-md w-full rounded-2xl bg-slate-800/80 backdrop-blur border border-slate-700/60 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <BuildingStorefrontIcon className="w-8 h-8" strokeWidth={1.8} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Restaurant Management
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Hệ thống quản lý nhà hàng thông minh & vận hành hiệu quả
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-xl bg-amber-600 px-4 py-3 font-semibold text-white transition hover:bg-amber-500 shadow-lg shadow-amber-900/30"
          >
            Đăng nhập hệ thống
          </Link>
          <Link
            href="/register"
            className="flex w-full items-center justify-center rounded-xl bg-slate-700/80 px-4 py-3 font-medium text-slate-200 transition hover:bg-slate-700 border border-slate-600"
          >
            Đăng ký tài khoản
          </Link>
        </div>
      </div>
    </main>
  );
}