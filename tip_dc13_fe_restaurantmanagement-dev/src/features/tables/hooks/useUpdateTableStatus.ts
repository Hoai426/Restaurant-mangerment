import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tableService } from "../services/table.service";
import type { RestaurantTable, TableUpdateStatusRequest } from "@/types/table";

export interface UpdateTableStatusVariables {
  id: number;
  payload: TableUpdateStatusRequest;
}

export interface UseUpdateTableStatusOptions {
  onSuccess?: (data: RestaurantTable) => void;
  onError?: (err: unknown) => void;
}

export function useUpdateTableStatus(options?: UseUpdateTableStatusOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateTableStatusVariables) =>
      tableService.updateTableStatus(id, payload),
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
