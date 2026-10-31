"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import type { RevenueSummary, RevenueTimelinePoint, ReportGroupBy } from "@/types/report";

export interface ExportExcelButtonProps {
  summary?: RevenueSummary;
  timeline?: RevenueTimelinePoint[];
  startDate: string;
  endDate: string;
  groupBy: ReportGroupBy;
  disabled?: boolean;
}

export function ExportExcelButton({
  summary,
  timeline = [],
  startDate,
  endDate,
  disabled = false,
}: ExportExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const hasData = timeline.length > 0 && Boolean(summary);
  const isDisabled = disabled || !hasData || isExporting;

  const handleExport = () => {
    if (!hasData || !summary) return;

    try {
      setIsExporting(true);

      // 1. Tạo các hàng dữ liệu chi tiết
      const rows = timeline.map((item) => ({
        "Mốc thời gian": item.period,
        "Số đơn hoàn tất": Number(item.orderCount),
        "Tiền mặt (VNĐ)": Number(item.cashAmount),
        "Thẻ ngân hàng (POS) (VNĐ)": Number(item.cardAmount),
        "Chuyển khoản QR (VNĐ)": Number(item.qrAmount),
        "Tổng doanh thu (VNĐ)": Number(item.revenue),
      }));

      // 2. Thêm hàng TỔNG CỘNG ở cuối bảng lấy chính xác từ summary của Backend
      rows.push({
        "Mốc thời gian": "TỔNG CỘNG",
        "Số đơn hoàn tất": Number(summary.totalOrders),
        "Tiền mặt (VNĐ)": Number(summary.cashAmount),
        "Thẻ ngân hàng (POS) (VNĐ)": Number(summary.cardAmount),
        "Chuyển khoản QR (VNĐ)": Number(summary.qrAmount),
        "Tổng doanh thu (VNĐ)": Number(summary.totalRevenue),
      });

      // 3. Tạo worksheet và workbook
      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Cấu hình độ rộng cột cho đẹp
      worksheet["!cols"] = [
        { wch: 22 }, // Mốc thời gian
        { wch: 18 }, // Số đơn
        { wch: 20 }, // Tiền mặt
        { wch: 26 }, // Thẻ POS
        { wch: 24 }, // QR
        { wch: 24 }, // Tổng doanh thu
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Báo cáo doanh thu");

      // 4. Tải file về máy
      const fileName = `Bao_Cao_Doanh_Thu_${startDate}_${endDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (err) {
      console.error("Lỗi khi xuất file Excel:", err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isDisabled}
      title={
        !hasData
          ? "Không có dữ liệu để xuất Excel"
          : `Xuất file Excel báo cáo từ ${startDate} đến ${endDate}`
      }
      className={`h-9 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs ${
        isDisabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
          : "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm hover:shadow"
      }`}
    >
      {isExporting ? (
        <>
          <IconSpinner />
          <span>Đang xuất...</span>
        </>
      ) : (
        <>
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span>Xuất Excel</span>
        </>
      )}
    </button>
  );
}

export default ExportExcelButton;
