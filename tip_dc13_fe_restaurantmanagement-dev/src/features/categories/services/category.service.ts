import { apiClient } from "@/services/api-client";
import { authHeader } from "@/utils/auth";
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  UpdateCategoryStatusRequest,
} from "@/types/category";

export const categoryService = {
  async getCategories(): Promise<Category[]> {
    const data = await apiClient<Category[]>("/api/categories", {
      headers: authHeader(),
    });
    return data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const data = await apiClient<Category>(`/api/categories/${id}`, {
      headers: authHeader(),
    });
    return data;
  },

  async createCategory(payload: CreateCategoryRequest): Promise<Category> {
    const data = await apiClient<Category>("/api/categories", {
      method: "POST",
      body: payload,
      headers: authHeader(),
    });
    return data;
  },

  async updateCategory(id: number, payload: UpdateCategoryRequest): Promise<Category> {
    const data = await apiClient<Category>(`/api/categories/${id}`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
    return data;
  },

  async updateCategoryStatus(id: number, payload: UpdateCategoryStatusRequest): Promise<Category> {
    const data = await apiClient<Category>(`/api/categories/${id}/status`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
    return data;
  },
};
