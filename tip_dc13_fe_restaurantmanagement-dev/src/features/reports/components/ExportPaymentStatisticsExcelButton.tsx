"use client";

import React from "react";
import type { PaymentStatisticsData } from "@/types/report";
import { PAYMENT_METHOD_CONFIG, PAYMENT_STATUS_CONFIG } from "@/features/orders/constants/payment.constants";
import { mapPaymentMethods, mapPaymentStatuses } from "../constants/payment-report.constants";
import { ReportExcelExportButton } from "./ReportExcelExportButton";

interface ExportPaymentStatisticsExcelButtonProps {
  data?: PaymentStatisticsData;
  startDate: string;
  endDate: string;
  disabled?: boolean;
}

function getDateFilePart(startDate: string, endDate: string): string {
  if (startDate && endDate) return `${startDate}_${endDate}`;
  if (startDate) return `Tu_${startDate}`;
  if (endDate) return `Den_${endDate}`;
  return "Moi_Thoi_Gian";
}

export function ExportPaymentStatisticsExcelButton({
  data,
  startDate,
  endDate,
  disabled = false,
}: ExportPaymentStatisticsExcelButtonProps) {
  const methods = mapPaymentMethods(data?.byMethod);
  const statuses = mapPaymentStatuses(data?.byStatus);
  const dateRange = startDate && endDate
    ? `${startDate} đến ${endDate}`
    : startDate
      ? `Từ ${startDate}`
      : endDate
        ? `Đến ${endDate}`
        : "Mọi thời gian";

  const sheets = data ? [
    {
      name: "Tổng quan",
      rows: [
        { "Chỉ số": "Khoảng thời gian", "Giá trị": dateRange },
        { "Chỉ số": "Tổng giao dịch", "Giá trị": Number(data.summary.totalPayments) },
        { "Chỉ số": "Tổng tiền giao dịch (VND)", "Giá trị": Number(data.summary.totalAmount) },
        { "Chỉ số": "Ghi chú", "Giá trị": "Tổng tiền bao gồm giao dịch ở mọi trạng thái." },
        { "Chỉ số": "Phạm vi phương thức", "Giá trị": "Nhóm theo phương thức và nhóm theo trạng thái là hai phân loại của cùng tập giao dịch; không cộng chéo hai bảng." },
      ],
      columnWidths: [28, 92],
    },
    {
      name: "Theo phương thức",
      rows: methods.map((item) => ({
        "Phương thức": PAYMENT_METHOD_CONFIG[item.method].label,
        "Số giao dịch": Number(item.paymentCount),
        "Tổng tiền (VND)": Number(item.totalAmount),
      })),
      columnWidths: [28, 18, 24],
    },
    {
      name: "Theo trạng thái",
      rows: statuses.map((item) => ({
        "Trạng thái": PAYMENT_STATUS_CONFIG[item.status].label,
        "Số giao dịch": Number(item.paymentCount),
        "Tổng tiền (VND)": Number(item.totalAmount),
      })),
      columnWidths: [28, 18, 24],
    },
  ] : [];

  return (
    <ReportExcelExportButton
      fileName={`Thong_Ke_Thanh_Toan_${getDateFilePart(startDate, endDate)}.xlsx`}
      sheets={sheets}
      disabled={disabled || !data}
      disabledReason={disabled ? "Đợi báo cáo tải xong để xuất Excel." : "Chưa có dữ liệu thanh toán để xuất."}
    />
  );
}

export default ExportPaymentStatisticsExcelButton;
