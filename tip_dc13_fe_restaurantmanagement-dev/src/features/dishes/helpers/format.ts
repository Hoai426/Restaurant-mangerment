import type { Dish } from "@/types/dish";
import type { Category } from "@/types/category";

export function getCategoryName(dish: Dish, categories?: Category[]): string {
  if (dish.categories && dish.categories.length > 0) {
    const names = dish.categories
      .map((cat) => {
        if (cat.name?.trim()) return cat.name.trim();
        const found = categories?.find((c) => c.id === cat.id);
        return found?.name?.trim() || "";
      })
      .filter(Boolean);

    if (names.length > 0) {
      return names.join(", ");
    }
  }
  return "Chưa phân loại";
}
