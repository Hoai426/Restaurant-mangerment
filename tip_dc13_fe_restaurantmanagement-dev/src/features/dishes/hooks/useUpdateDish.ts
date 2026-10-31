import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dishService } from "../services/dish.service";
import type { Dish, UpdateDishRequest } from "@/types/dish";

export interface UpdateDishVariables {
  id: number;
  payload: UpdateDishRequest;
}

export interface UseUpdateDishOptions {
  onSuccess?: (data: Dish) => void;
  onError?: (err: Error) => void;
}

export function useUpdateDish(options?: UseUpdateDishOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateDishVariables) =>
      dishService.updateDish(id, payload),
    onSuccess: async (data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["dishes"] }),
        queryClient.invalidateQueries({ queryKey: ["dish", variables.id] }),
      ]);
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
