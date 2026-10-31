import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dishService } from "../services/dish.service";
import type { UpdateDishStatusRequest, Dish } from "@/types/dish";

export interface UpdateDishStatusVariables {
  id: number;
  data: UpdateDishStatusRequest;
}

export interface UseUpdateDishStatusOptions {
  onSuccess?: (data: Dish) => void;
  onError?: (err: Error) => void;
}

export function useUpdateDishStatus(options?: UseUpdateDishStatusOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateDishStatusVariables) =>
      dishService.updateDishStatus(id, data),
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dishes"] }),
        queryClient.invalidateQueries({ queryKey: ["dishes", variables.id] }),
      ]);
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
