import Link from "next/link";
import RevenueReportClient from "./RevenueReportClient";
import OrderStatsClient from "./OrderStatsClient";
import type { Metadata } from "next";
import { CakeIcon, ChartBarIcon, CreditCardIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import DishSalesReportClient from "./DishSalesReportClient";
import PaymentStatisticsClient from "./PaymentStatisticsClient";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const isOrders = params?.tab === "orders";
  const isDishSales = params?.tab === "dish-sales";
  const isPaymentStatistics = params?.tab === "payment-statistics";
  return {
    title: isPaymentStatistics
      ? "Thống kê thanh toán | Restaurant Management"
      : isDishSales
        ? "Doanh số món ăn | Restaurant Management"
        : isOrders
          ? "Thống kê đơn hàng | Restaurant Management"
          : "Báo cáo doanh thu | Restaurant Management",
    description: isPaymentStatistics
      ? "Thống kê giao dịch thanh toán theo phương thức và trạng thái"
      : isDishSales
        ? "Báo cáo số lượng bán và doanh thu món ăn từ các đơn hàng hoàn tất"
        : isOrders
          ? "Trang tra cứu, thống kê đơn hàng theo trạng thái và phân khúc giá trị"
          : "Trang tra cứu, thống kê và phân tích doanh thu nhà hàng theo thời gian",
  };
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeTab = params?.tab === "orders"
    ? "orders"
    : params?.tab === "dish-sales"
      ? "dish-sales"
      : params?.tab === "payment-statistics"
        ? "payment-statistics"
      : "revenue";
  const pageClassName = activeTab === "revenue"
    ? "flex h-full min-h-0 flex-col gap-3 overflow-hidden"
    : activeTab === "orders"
      ? "-mt-3 space-y-2 lg:mt-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:gap-2 lg:overflow-hidden lg:space-y-0"
      : "space-y-6";

  return (
    <div className={pageClassName}>
      {/* Thanh chuyển tab Báo cáo doanh thu / Thống kê đơn hàng */}
      <div className="inline-flex max-w-full shrink-0 flex-wrap items-center gap-1.5 rounded-2xl border border-gray-100 bg-white p-1.5 shadow-xs">
        <Link
          href="/dashboard/reports?tab=revenue"
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "revenue"
              ? "bg-rms-burgundy text-white shadow-2xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <ChartBarIcon className="w-4 h-4" />
          <span>Báo cáo doanh thu</span>
        </Link>

        <Link
          href="/dashboard/reports?tab=orders"
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "orders"
              ? "bg-rms-burgundy text-white shadow-2xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <ShoppingBagIcon className="w-4 h-4" />
          <span>Thống kê đơn hàng</span>
        </Link>

        <Link
          href="/dashboard/reports?tab=dish-sales"
          aria-current={activeTab === "dish-sales" ? "page" : undefined}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "dish-sales"
              ? "bg-rms-burgundy text-white shadow-2xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <CakeIcon className="w-4 h-4" />
          <span>Doanh số món ăn</span>
        </Link>

        <Link
          href="/dashboard/reports?tab=payment-statistics"
          aria-current={activeTab === "payment-statistics" ? "page" : undefined}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "payment-statistics"
              ? "bg-rms-burgundy text-white shadow-2xs"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          }`}
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>Thống kê thanh toán</span>
        </Link>
      </div>

      {/* Nội dung tab tương ứng */}
      {activeTab === "orders" ? (
        <div className="min-h-0 lg:flex-1">
          <OrderStatsClient />
        </div>
      ) : activeTab === "dish-sales" ? (
        <DishSalesReportClient />
      ) : activeTab === "payment-statistics" ? (
        <PaymentStatisticsClient />
      ) : (
        <div className="min-h-0 flex-1">
          <RevenueReportClient />
        </div>
      )}
    </div>
  );
}
