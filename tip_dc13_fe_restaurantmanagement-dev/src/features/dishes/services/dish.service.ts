import { apiClient } from "@/services/api-client";
import { authHeader } from "@/utils/auth";
import type {
  Dish,
  CreateDishRequest,
  UpdateDishRequest,
  UpdateDishStatusRequest,
  SearchRequest,
  PageResponse,
} from "@/types/dish";

export const dishService = {
  async getDishes(): Promise<Dish[]> {
    return apiClient<Dish[]>("/api/dishes", {
      headers: authHeader(),
    });
  },

  async getDishById(id: number): Promise<Dish> {
    return apiClient<Dish>(`/api/dishes/${id}`, {
      headers: authHeader(),
    });
  },

  // RM-85: POST /api/dishes/search — Generic Search/Filter
  // unwrap Page<DishResponse>.content → Dish[]
  async searchDishes(
    payload: SearchRequest,
    { page = 0, size = 1000 }: { page?: number; size?: number } = {}
  ): Promise<Dish[]> {
    const page_response = await apiClient<PageResponse<Dish>>(
      `/api/dishes/search?page=${page}&size=${size}`,
      {
        method: "POST",
        body: payload,
        headers: authHeader(),
      }
    );
    return page_response.content ?? [];
  },

  async createDish(payload: CreateDishRequest): Promise<Dish> {
    return apiClient<Dish>("/api/dishes", {
      method: "POST",
      body: payload,
      headers: authHeader(),
    });
  },

  async updateDish(id: number, payload: UpdateDishRequest): Promise<Dish> {
    return apiClient<Dish>(`/api/dishes/${id}`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },

  async updateDishStatus(
    id: number,
    payload: UpdateDishStatusRequest
  ): Promise<Dish> {
    return apiClient<Dish>(`/api/dishes/${id}/status`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },
};
