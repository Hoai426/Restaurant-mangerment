import type { DishSalesSortBy } from "@/types/report";

export const DISH_SALES_SORT_LABELS: Record<DishSalesSortBy, string> = {
  DISH_NAME: "Tên món",
  QUANTITY_SOLD: "Số lượng bán",
  REVENUE: "Doanh thu",
};

export const DISH_SALES_PAGE_SIZE_OPTIONS = [20, 50, 100];
