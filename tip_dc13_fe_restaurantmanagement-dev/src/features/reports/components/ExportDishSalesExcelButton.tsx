"use client";

import React from "react";
import type { DishSalesReportItem, TopSellingDishItem } from "@/types/report";
import { DISH_SALES_SORT_LABELS } from "../constants/dish-sales-report.constants";
import type { DishSalesSortBy, DishSalesSortDirection } from "@/types/report";
import { ReportExcelExportButton } from "./ReportExcelExportButton";

interface ExportDishSalesExcelButtonProps {
  items: DishSalesReportItem[];
  page: number;
  pageSize: number;
  totalElements: number;
  sortBy: DishSalesSortBy;
  direction: DishSalesSortDirection;
  disabled?: boolean;
}

interface ExportTopSellingDishesExcelButtonProps {
  items: TopSellingDishItem[];
  startDate: string | null;
  endDate: string | null;
  limit: number;
  disabled?: boolean;
}

export function ExportDishSalesExcelButton({
  items,
  page,
  pageSize,
  totalElements,
  sortBy,
  direction,
  disabled = false,
}: ExportDishSalesExcelButtonProps) {
  const totalPages = Math.ceil(totalElements / pageSize);
  const sheets = items.length > 0 ? [
    {
      name: "Phạm vi xuất",
      rows: [
        { "Thông tin": "Phạm vi", "Giá trị": `Chỉ trang ${page + 1}/${totalPages}; không bao gồm các trang khác.` },
        { "Thông tin": "Số món trong trang", "Giá trị": items.length },
        { "Thông tin": "Tổng số món theo bộ lọc", "Giá trị": totalElements },
        { "Thông tin": "Sắp xếp", "Giá trị": `${DISH_SALES_SORT_LABELS[sortBy]} (${direction === "ASC" ? "tăng dần" : "giảm dần"})` },
      ],
      columnWidths: [32, 72],
    },
    {
      name: "Doanh số món",
      rows: items.map((item) => ({
        "Mã món": Number(item.dishId),
        "Tên món": item.dishName,
        "Số lượng bán": Number(item.quantitySold),
        "Doanh thu (VND)": Number(item.revenue),
      })),
      columnWidths: [14, 36, 18, 24],
    },
  ] : [];

  return (
    <ReportExcelExportButton
      fileName={`Doanh_So_Mon_Trang_${page + 1}_Trong_${totalPages}.xlsx`}
      sheets={sheets}
      buttonLabel="Xuất trang hiện tại"
      disabled={disabled || items.length === 0}
      disabledReason={items.length === 0 ? "Trang hiện tại không có món để xuất." : "Đợi dữ liệu trang hiện tại tải xong để xuất."}
    />
  );
}

export function ExportTopSellingDishesExcelButton({
  items,
  startDate,
  endDate,
  limit,
  disabled = false,
}: ExportTopSellingDishesExcelButtonProps) {
  const rangeLabel = startDate && endDate
    ? `${startDate} đến ${endDate}`
    : "Mọi thời gian";
  const fileRange = startDate && endDate
    ? `${startDate}_${endDate}`
    : "Moi_Thoi_Gian";
  const sheets = items.length > 0 ? [
    {
      name: "Thông tin",
      rows: [
        { "Thông tin": "Khoảng thời gian", "Giá trị": rangeLabel },
        { "Thông tin": "Giới hạn món", "Giá trị": limit },
        { "Thông tin": "Số món được trả về", "Giá trị": items.length },
        { "Thông tin": "Cách xếp hạng", "Giá trị": "Số lượng bán giảm dần; nếu bằng nhau, mã món tăng dần." },
      ],
      columnWidths: [28, 76],
    },
    {
      name: "Top bán chạy",
      rows: items.map((item) => ({
        "Hạng": Number(item.rank),
        "Mã món": Number(item.dishId),
        "Tên món": item.dishName,
        "Số lượng bán": Number(item.quantitySold),
        "Doanh thu (VND)": Number(item.revenue),
      })),
      columnWidths: [10, 14, 36, 18, 24],
    },
  ] : [];

  return (
    <ReportExcelExportButton
      fileName={`Top_Mon_Ban_Chay_${fileRange}_Toi_Da_${limit}.xlsx`}
      sheets={sheets}
      buttonLabel="Xuất Excel"
      disabled={disabled || items.length === 0}
      disabledReason={items.length === 0 ? "Không có món bán chạy để xuất." : "Đợi danh sách món bán chạy tải xong để xuất."}
    />
  );
}

export default ExportDishSalesExcelButton;
