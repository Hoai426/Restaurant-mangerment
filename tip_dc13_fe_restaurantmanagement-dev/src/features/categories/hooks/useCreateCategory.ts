import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "../services/category.service";
import type { CreateCategoryRequest, Category } from "@/types/category";

interface UseCreateCategoryOptions {
  onSuccess?: (data: Category) => void;
  onError?: (err: Error) => void;
}

export function useCreateCategory(options?: UseCreateCategoryOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoryService.createCategory(data),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
