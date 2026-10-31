import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableService } from "../services/table.service";
import type { RestaurantTable, TableCreateRequest } from "@/types/table";

export interface UseCreateTableOptions {
  onSuccess?: (data: RestaurantTable) => void;
  onError?: (err: Error) => void;
}

export function useCreateTable(options?: UseCreateTableOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TableCreateRequest) => tableService.createTable(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
