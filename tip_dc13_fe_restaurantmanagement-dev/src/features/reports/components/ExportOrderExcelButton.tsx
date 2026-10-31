"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";
import {
  formatOrderStatusLabel,
  formatOrderStatusLabelLower,
  formatOrderValueRangeLabel,
  type OrderStatusFilterKey,
} from "../constants/order-report.constants";
import type { OrderStatisticsData } from "@/types/report";

export interface ExportOrderExcelButtonProps {
  data?: OrderStatisticsData;
  startDate: string;
  endDate: string;
  statusFilter: OrderStatusFilterKey;
  disabled?: boolean;
}

const statusDescription: Record<OrderStatusFilterKey, string> = {
  ALL: "đơn ở cả 4 trạng thái (gồm cả đơn đang chờ xử lý và đã xác nhận; tổng giá trị không phải doanh thu đã thu)",
  PENDING: "đơn chờ xử lý",
  CONFIRMED: "đơn đã xác nhận",
  COMPLETED: "đơn hoàn tất",
  CANCELLED: "đơn đã hủy",
};

const excelStatusSuffix: Record<OrderStatusFilterKey, string> = {
  ALL: "Tat_Ca_Trang_Thai",
  PENDING: "Don_Cho_Xu_Ly",
  CONFIRMED: "Don_Da_Xac_Nhan",
  COMPLETED: "Don_Hoan_Tat",
  CANCELLED: "Don_Da_Huy",
};

type ExcelRow = Record<string, string | number>;

export function ExportOrderExcelButton({
  data,
  startDate,
  endDate,
  statusFilter,
  disabled = false,
}: ExportOrderExcelButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<"success" | "error" | null>(null);

  const totalOrders = data?.summary?.totalOrders ?? 0;
  const hasData = Boolean(data && data.byStatus && data.byStatus.length > 0);
  const isDisabled = disabled || !hasData || isExporting;
  const totalPercentage = totalOrders > 0 ? "100.0%" : "0.0%";
  const scopeNote =
    statusFilter === "ALL"
      ? "Phạm vi: cả 4 trạng thái. Tổng giá trị bao gồm cả đơn đang chờ xử lý và đã xác nhận; không phải doanh thu đã thu."
      : `Phạm vi: chỉ đơn ${formatOrderStatusLabelLower(statusFilter)}.`;

  const handleExport = () => {
    if (!data) return;

    try {
      setIsExporting(true);
      setExportFeedback(null);
      const workbook = XLSX.utils.book_new();

      // Sheet 1: Thống kê theo Trạng thái
      const statusRows: ExcelRow[] = (data.byStatus || []).map((item) => {
        const pct = totalOrders > 0 ? ((item.orderCount / totalOrders) * 100).toFixed(1) : "0.0";
        return {
          "Trạng thái": formatOrderStatusLabel(item.status),
          "Số đơn": Number(item.orderCount),
          "Tổng giá trị (VNĐ)": Number(item.totalValue),
          "Tỷ trọng (%)": `${pct}%`,
        };
      });

      // Ghi chú phạm vi nằm ngay trước hàng tổng để hàng tổng vẫn là dòng cuối
      statusRows.push({
        "Trạng thái": scopeNote,
        "Số đơn": "",
        "Tổng giá trị (VNĐ)": "",
        "Tỷ trọng (%)": "",
      });

      statusRows.push({
        "Trạng thái": "TỔNG CỘNG",
        "Số đơn": Number(data.summary.totalOrders),
        "Tổng giá trị (VNĐ)": Number(data.summary.totalValue),
        "Tỷ trọng (%)": totalPercentage,
      });

      const wsStatus = XLSX.utils.json_to_sheet(statusRows);
      wsStatus["!cols"] = [{ wch: 20 }, { wch: 14 }, { wch: 22 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(workbook, wsStatus, "Theo trạng thái");

      // Sheet 2: Thống kê theo Khoảng giá trị
      const valueRows: ExcelRow[] = (data.byValueRange || []).map((item) => {
        const pct = totalOrders > 0 ? ((item.orderCount / totalOrders) * 100).toFixed(1) : "0.0";
        return {
          "Khoảng giá trị": formatOrderValueRangeLabel(item.range),
          "Số đơn": Number(item.orderCount),
          "Tổng giá trị (VNĐ)": Number(item.totalValue),
          "Tỷ trọng (%)": `${pct}%`,
        };
      });

      valueRows.push({
        "Khoảng giá trị": scopeNote,
        "Số đơn": "",
        "Tổng giá trị (VNĐ)": "",
        "Tỷ trọng (%)": "",
      });

      valueRows.push({
        "Khoảng giá trị": "TỔNG CỘNG",
        "Số đơn": Number(data.summary.totalOrders),
        "Tổng giá trị (VNĐ)": Number(data.summary.totalValue),
        "Tỷ trọng (%)": totalPercentage,
      });

      const wsValue = XLSX.utils.json_to_sheet(valueRows);
      wsValue["!cols"] = [{ wch: 26 }, { wch: 14 }, { wch: 22 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(workbook, wsValue, "Theo khoảng giá");

      // Tải file về
      const fileName = `Thong_Ke_Don_Hang_${excelStatusSuffix[statusFilter]}_${startDate}_${endDate}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      setExportFeedback("success");
    } catch {
      setExportFeedback("error");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleExport}
        disabled={isDisabled}
        title={
          !hasData
            ? "Không có dữ liệu để xuất Excel"
            : `Xuất file Excel thống kê ${statusDescription[statusFilter]} từ ${startDate} đến ${endDate}`
        }
        className={`h-9 inline-flex items-center justify-center gap-1.5 px-3.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2 ${
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
      {exportFeedback && (
        <span
          role={exportFeedback === "error" ? "alert" : "status"}
          className={`mt-1 text-xs ${exportFeedback === "success" ? "text-emerald-700" : "text-red-700"}`}
        >
          {exportFeedback === "success"
            ? "Đã tạo file Excel."
            : "Không thể xuất file. Vui lòng thử lại."}
        </span>
      )}
    </div>
  );
}

export default ExportOrderExcelButton;
