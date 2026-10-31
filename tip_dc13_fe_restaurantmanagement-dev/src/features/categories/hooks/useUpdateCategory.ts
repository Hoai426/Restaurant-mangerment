import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../services/category.service";
import type { UpdateCategoryRequest, Category } from "@/types/category";

interface UseUpdateCategoryOptions {
  onSuccess?: (data: Category) => void;
  onError?: (err: Error) => void;
}

export function useUpdateCategory(options?: UseUpdateCategoryOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateCategoryRequest }) =>
      categoryService.updateCategory(id, data),
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
