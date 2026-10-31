import { useQuery } from "@tanstack/react-query";
import { dishService } from "../services/dish.service";

export function useDishDetail(id: number | null) {
  return useQuery({
    queryKey: ["dishes", id],
    queryFn: () => {
      if (typeof id !== "number" || id <= 0) {
        throw new Error("Dish ID is required");
      }
      return dishService.getDishById(id);
    },
    enabled: typeof id === "number" && id > 0,
  });
}
