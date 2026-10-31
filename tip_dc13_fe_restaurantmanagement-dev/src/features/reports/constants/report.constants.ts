import { format, subDays, startOfMonth } from "date-fns";
import type { ReportDatePreset, ReportGroupBy } from "@/types/report";

export interface PresetOption {
  key: ReportDatePreset;
  label: string;
}

export const PRESET_OPTIONS: PresetOption[] = [
  { key: "TODAY", label: "Hôm nay" },
  { key: "YESTERDAY", label: "Hôm qua" },
  { key: "LAST_7_DAYS", label: "7 ngày qua" },
  { key: "THIS_MONTH", label: "Tháng này" },
];

export interface GroupByOption {
  value: ReportGroupBy;
  label: string;
}

export const GROUP_BY_OPTIONS: GroupByOption[] = [
  { value: "DAY", label: "Theo Ngày" },
  { value: "WEEK", label: "Theo Tuần" },
  { value: "MONTH", label: "Theo Tháng" },
];

/**
 * Tính toán ngày bắt đầu và ngày kết thúc cho các Quick Filter Presets
 */
export function getPresetDateRange(preset: ReportDatePreset): { startDate: string; endDate: string } {
  const today = new Date();
  const formatPattern = "yyyy-MM-dd";

  switch (preset) {
    case "TODAY":
      return {
        startDate: format(today, formatPattern),
        endDate: format(today, formatPattern),
      };
    case "YESTERDAY": {
      const yesterday = subDays(today, 1);
      return {
        startDate: format(yesterday, formatPattern),
        endDate: format(yesterday, formatPattern),
      };
    }
    case "LAST_7_DAYS": {
      // 7 ngày qua tính cả ngày hôm nay: today - 6 days đến today
      const startDay = subDays(today, 6);
      return {
        startDate: format(startDay, formatPattern),
        endDate: format(today, formatPattern),
      };
    }
    case "THIS_MONTH": {
      const monthStart = startOfMonth(today);
      return {
        startDate: format(monthStart, formatPattern),
        endDate: format(today, formatPattern),
      };
    }
  }
}

const VI_DAYS_OF_WEEK = [
  "Chủ Nhật",
  "Thứ Hai",
  "Thứ Ba",
  "Thứ Tư",
  "Thứ Năm",
  "Thứ Sáu",
  "Thứ Bảy",
];

export interface DetailedPeriodDisplay {
  primary: string;
  secondary?: string;
}

/**
 * Định dạng mốc thời gian chi tiết gồm dòng chính và dòng phụ (dùng cho bảng và tooltip)
 * - DAY: dòng chính "13/10", dòng phụ "Thứ Ba"
 * - HOUR: dòng chính "14:00", dòng phụ "Ngày 13/10"
 * - WEEK: dòng chính "Tuần 42", dòng phụ "Năm 2026"
 * - MONTH: dòng chính "Tháng 10/2026"
 */
export function formatTimelinePeriodDetailed(
  period: string,
  groupBy: ReportGroupBy = "DAY"
): DetailedPeriodDisplay {
  if (!period) return { primary: "—" };

  switch (groupBy) {
    case "DAY": {
      // Mẫu từ backend: "2026-10-13"
      const parts = period.split("-");
      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const day = Number(parts[2]);
        const dateObj = new Date(year, month - 1, day);
        const dayOfWeek = VI_DAYS_OF_WEEK[dateObj.getDay()] || "";
        return {
          primary: `${parts[2]}/${parts[1]}`,
          secondary: dayOfWeek,
        };
      }
      return { primary: period };
    }
    case "HOUR": {
      // Mẫu từ backend: "2026-10-13 14:00"
      const parts = period.split(" ");
      if (parts.length >= 2) {
        const dateParts = parts[0].split("-");
        const dateFormatted =
          dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : parts[0];
        return {
          primary: parts[1],
          secondary: `Ngày ${dateFormatted}`,
        };
      }
      return { primary: period };
    }
    case "WEEK": {
      // Mẫu từ backend: "2026-W42"
      const match = period.match(/^(\d{4})-W(\d+)/i);
      if (match) {
        return {
          primary: `Tuần ${match[2]}`,
          secondary: `Năm ${match[1]}`,
        };
      }
      return { primary: period };
    }
    case "MONTH": {
      // Mẫu từ backend: "2026-10"
      const parts = period.split("-");
      if (parts.length === 2) {
        return {
          primary: `Tháng ${parts[1]}/${parts[0]}`,
        };
      }
      return { primary: period };
    }
    default:
      return { primary: period };
  }
}

/**
 * Helper định dạng mốc thời gian hiển thị thân thiện trên UI/Chart theo từng groupBy (chuỗi đơn lẻ)
 */
export function formatTimelinePeriod(period: string, groupBy: ReportGroupBy = "DAY"): string {
  if (!period) return "—";

  switch (groupBy) {
    case "HOUR": {
      // "2026-10-16 08:00" -> "08:00"
      const parts = period.split(" ");
      return parts.length >= 2 ? parts[1] : period;
    }
    case "DAY": {
      // "2026-10-16" -> "16/10"
      const parts = period.split("-");
      return parts.length === 3 ? `${parts[2]}/${parts[1]}` : period;
    }
    case "WEEK": {
      // "2026-W42" -> "Tuần 42"
      const match = period.match(/W(\d+)/i);
      return match ? `Tuần ${match[1]}` : period;
    }
    case "MONTH": {
      // "2026-10" -> "10/2026"
      const parts = period.split("-");
      return parts.length === 2 ? `${parts[1]}/${parts[0]}` : period;
    }
    default:
      return period;
  }
}

