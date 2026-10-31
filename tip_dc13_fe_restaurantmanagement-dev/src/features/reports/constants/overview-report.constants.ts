import { addDays, format, parse } from "date-fns";
import type { OverviewStatisticsFilter } from "@/types/report";

/** Build the shared createdAt window used by payments, orders, and reservations. */
export function buildOverviewStatisticsFilters(
  startDate: string,
  endDate: string
): OverviewStatisticsFilter[] {
  const filters: OverviewStatisticsFilter[] = [];

  if (startDate) {
    filters.push({
      field: "createdAt",
      value: `${startDate}T00:00:00`,
      operation: "GTE",
    });
  }

  if (endDate) {
    const localDate = parse(endDate, "yyyy-MM-dd", new Date());
    const nextDate = format(addDays(localDate, 1), "yyyy-MM-dd");
    filters.push({
      field: "createdAt",
      value: `${nextDate}T00:00:00`,
      operation: "LT",
    });
  }

  return filters;
}
