import { useQuery } from "@tanstack/react-query";
import { orderService } from "../services/order.service";
import type { OrderResponse, OrderFilterState } from "@/types/order";
import type { PageResponse, SearchRequest, FilterCriteria } from "@/types/search";

export interface UseOrdersOptions {
  enabled?: boolean;
}

export function useOrders(
  filters: OrderFilterState,
  page: number = 0,
  size: number = 10,
  options?: UseOrdersOptions
) {
  const normalizedOrderCode = filters.orderCode?.trim() || "";
  const normalizedStatus = filters.status || "ALL";
  const normalizedTableId = filters.tableId ?? null;
  const normalizedCreatedAt = filters.createdAt?.trim() || "";

  const isFiltered = Boolean(
    normalizedOrderCode ||
    normalizedStatus !== "ALL" ||
    normalizedTableId !== null ||
    normalizedCreatedAt
  );

  const queryKey = [
    "orders",
    "list",
    {
      page,
      size,
      orderCode: normalizedOrderCode,
      status: normalizedStatus,
      tableId: normalizedTableId,
      createdAt: normalizedCreatedAt,
    },
  ];

  return useQuery<PageResponse<OrderResponse>, Error>({
    queryKey,
    queryFn: async () => {
      // Nhánh 1: Không có bộ lọc -> GET /api/orders (Phân trang thuần túy)
      if (!isFiltered) {
        return orderService.getOrders({
          page,
          size,
          sort: "createdAt,desc",
        });
      }

      // Nhánh 2: Có ít nhất 1 bộ lọc -> POST /api/orders/search
      const filterCriteriaList: FilterCriteria[] = [];

      if (normalizedOrderCode) {
        filterCriteriaList.push({
          field: "orderCode",
          operation: "LIKE",
          value: normalizedOrderCode,
        });
      }

      if (normalizedStatus !== "ALL") {
        filterCriteriaList.push({
          field: "status",
          operation: "EQ",
          value: normalizedStatus,
        });
      }

      if (normalizedTableId !== null) {
        filterCriteriaList.push({
          field: "table.id",
          operation: "EQ",
          value: normalizedTableId,
        });
      }

      if (normalizedCreatedAt) {
        // Chuẩn hóa lọc ngày tạo: Bao trọn khoảng 24h (00:00:00 đến 23:59:59)
        filterCriteriaList.push({
          field: "createdAt",
          operation: "GTE",
          value: `${normalizedCreatedAt}T00:00:00`,
        });
        filterCriteriaList.push({
          field: "createdAt",
          operation: "LTE",
          value: `${normalizedCreatedAt}T23:59:59`,
        });
      }

      const searchPayload: SearchRequest = {
        filters: filterCriteriaList,
        sorts: [{ field: "createdAt", direction: "DESC" }],
      };

      return orderService.searchOrders(searchPayload, { page, size });
    },
    enabled: options?.enabled ?? true,
    staleTime: 15 * 1000,
  });
}

export default useOrders;
