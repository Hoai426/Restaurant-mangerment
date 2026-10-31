import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../services/category.service";
import type { UpdateCategoryStatusRequest, Category } from "@/types/category";

interface UseUpdateCategoryStatusOptions {
  onSuccess?: (data: Category) => void;
  onError?: (err: Error) => void;
}

export function useUpdateCategoryStatus(options?: UseUpdateCategoryStatusOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryStatusRequest }) =>
      categoryService.updateCategoryStatus(id, data),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories", variables.id] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}

