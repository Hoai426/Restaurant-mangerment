import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { tableService } from "../services/table.service";
import type { RestaurantTable, SearchRequest } from "@/types/table";

export function useTables(searchRequest?: SearchRequest) {
  const request: SearchRequest = searchRequest ?? {};
  return useQuery<RestaurantTable[], Error>({
    queryKey: ["tables", "search", request],
    queryFn: () => tableService.searchTables(request),
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export default useTables;
