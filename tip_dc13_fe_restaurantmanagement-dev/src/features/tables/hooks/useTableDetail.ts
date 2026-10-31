import { useQuery } from "@tanstack/react-query";
import { tableService } from "../services/table.service";
import type { RestaurantTable } from "@/types/table";

export interface UseTableDetailOptions {
  enabled?: boolean;
}

export function useTableDetail(
  id: number | null | undefined,
  options?: UseTableDetailOptions
) {
  const isModalOpen = options?.enabled ?? true;
  const isValidId = typeof id === "number" && Number.isInteger(id) && id > 0;

  return useQuery<RestaurantTable, Error>({
    queryKey: ["tables", id],
    queryFn: () => tableService.getTableById(id!),
    enabled: isModalOpen && isValidId,
    staleTime: 30 * 1000,
  });
}

export default useTableDetail;
