import { useMutation, useQueryClient } from "@tanstack/react-query";
import { dishService } from "../services/dish.service";
import type { CreateDishRequest, Dish } from "@/types/dish";

export interface UseCreateDishOptions {
  onSuccess?: (data: Dish) => void;
  onError?: (err: Error) => void;
}

export function useCreateDish(options?: UseCreateDishOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDishRequest) => dishService.createDish(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["dishes"] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
