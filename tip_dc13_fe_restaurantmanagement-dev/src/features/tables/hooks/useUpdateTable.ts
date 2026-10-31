import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableService } from "../services/table.service";
import type { RestaurantTable, TableUpdateRequest } from "@/types/table";

export interface UpdateTableVariables {
  id: number;
  payload: TableUpdateRequest;
}

export interface UseUpdateTableOptions {
  onSuccess?: (data: RestaurantTable) => void;
  onError?: (err: unknown) => void;
}

export function useUpdateTable(options?: UseUpdateTableOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTableVariables) =>
      tableService.updateTable(id, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["tables", variables.id] });
      options?.onSuccess?.(data);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}
