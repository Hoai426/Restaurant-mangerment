import { apiClient } from "@/services/api-client";
import { authHeader } from "@/utils/auth";
import type {
  RestaurantTable,
  TableCreateRequest,
  TableUpdateRequest,
  TableUpdateStatusRequest,
  SearchRequest,
  PageResponse,
} from "@/types/table";

export const tableService = {
  async searchTables(
    payload: SearchRequest,
    { page = 0, size = 1000 }: { page?: number; size?: number } = {}
  ): Promise<RestaurantTable[]> {
    const pageResponse = await apiClient<PageResponse<RestaurantTable>>(
      `/api/tables/search?page=${page}&size=${size}`,
      {
        method: "POST",
        body: payload,
        headers: authHeader(),
      }
    );
    return pageResponse.content ?? [];
  },

  async createTable(payload: TableCreateRequest): Promise<RestaurantTable> {
    const res = await apiClient<RestaurantTable>("/api/tables", {
      method: "POST",
      body: payload,
      headers: authHeader(),
    });

    // Handle HTTP 204 No Content: synthesize fallback fields from payload
    if (!res || !res.id) {
      return {
        id: res?.id ?? 0,
        roomId: res?.roomId ?? payload.roomId,
        tableNumber: res?.tableNumber ?? payload.tableNumber,
        capacity: res?.capacity ?? payload.capacity,
        status: res?.status ?? "AVAILABLE",
        roomName: res?.roomName ?? "",
        createdAt: res?.createdAt ?? new Date().toISOString(),
        updatedAt: res?.updatedAt ?? new Date().toISOString(),
      };
    }

    return res;
  },

  async updateTable(id: number, payload: TableUpdateRequest): Promise<RestaurantTable> {
    const res = await apiClient<RestaurantTable>(`/api/tables/${id}`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });

    // Handle HTTP 204 No Content: synthesize fallback fields from id and payload
    if (!res || !res.id) {
      return {
        id,
        roomId: res?.roomId ?? payload.roomId ?? 0,
        tableNumber: res?.tableNumber ?? payload.tableNumber ?? "",
        capacity: res?.capacity ?? payload.capacity ?? 0,
        status: res?.status ?? "AVAILABLE",
        roomName: res?.roomName ?? "",
        createdAt: res?.createdAt ?? new Date().toISOString(),
        updatedAt: res?.updatedAt ?? new Date().toISOString(),
      };
    }

    return res;
  },

  async updateTableStatus(id: number, payload: TableUpdateStatusRequest): Promise<RestaurantTable> {
    const res = await apiClient<RestaurantTable>(`/api/tables/${id}/status`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });

    // Handle HTTP 204 No Content: synthesize fallback with id and new status
    if (!res || !res.id) {
      return {
        id,
        roomId: res?.roomId ?? 0,
        tableNumber: res?.tableNumber ?? "",
        capacity: res?.capacity ?? 0,
        status: res?.status ?? payload.status,
        roomName: res?.roomName ?? "",
        createdAt: res?.createdAt ?? new Date().toISOString(),
        updatedAt: res?.updatedAt ?? new Date().toISOString(),
      };
    }

    return res;
  },

  async getTables(): Promise<RestaurantTable[]> {
    return apiClient<RestaurantTable[]>("/api/tables", {
      headers: authHeader(),
    });
  },

  async getTableById(id: number): Promise<RestaurantTable> {
    return apiClient<RestaurantTable>(`/api/tables/${id}`, {
      method: "GET",
      headers: authHeader(),
    });
  },
};

