import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/features/categories/services/category.service";

export function useCategoryDetail(id: number | null) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => {
      if (!id) {
        throw new Error("Category ID is required");
      }
      return categoryService.getCategoryById(id);
    },
    enabled: typeof id === "number" && id > 0,
  });
}
