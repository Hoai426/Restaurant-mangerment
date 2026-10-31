"use client";

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";

export interface ReportExcelSheet {
  name: string;
  rows: Array<Record<string, string | number>>;
  columnWidths?: number[];
}

interface ReportExcelExportButtonProps {
  fileName: string;
  sheets: ReportExcelSheet[];
  buttonLabel?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function ReportExcelExportButton({
  fileName,
  sheets,
  buttonLabel = "Xuất Excel",
  disabled = false,
  disabledReason = "Báo cáo chưa có dữ liệu để xuất.",
}: ReportExcelExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<"success" | "error" | null>(null);

  const handleExport = () => {
    if (disabled || isExporting || sheets.length === 0) return;

    try {
      setIsExporting(true);
      setExportFeedback(null);

      const workbook = XLSX.utils.book_new();
      sheets.forEach((sheet) => {
        const worksheet = XLSX.utils.json_to_sheet(sheet.rows);
        if (sheet.columnWidths) {
          worksheet["!cols"] = sheet.columnWidths.map((wch) => ({ wch }));
        }
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
      });

      XLSX.writeFile(workbook, fileName);
      setExportFeedback("success");
    } catch {
      setExportFeedback("error");
    } finally {
      setIsExporting(false);
    }
  };

  const isDisabled = disabled || isExporting || sheets.length === 0;

  return (
    <div className="flex flex-col items-end">
      <button
        type="button"
        onClick={handleExport}
        disabled={isDisabled}
        title={isDisabled ? disabledReason : "Tạo và tải file Excel"}
        className={`inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
          isDisabled
            ? "border-gray-200 bg-gray-100 text-gray-400"
            : "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isExporting ? (
          <>
            <IconSpinner />
            <span>Đang xuất...</span>
          </>
        ) : (
          <>
            <ArrowDownTrayIcon aria-hidden="true" className="h-4 w-4" />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>
      {exportFeedback && (
        <span
          role={exportFeedback === "error" ? "alert" : "status"}
          className={`mt-1 text-[11px] ${exportFeedback === "success" ? "text-emerald-700" : "text-red-700"}`}
        >
          {exportFeedback === "success" ? "Đã tạo file Excel." : "Không thể xuất file. Vui lòng thử lại."}
        </span>
      )}
    </div>
  );
}

export default ReportExcelExportButton;
