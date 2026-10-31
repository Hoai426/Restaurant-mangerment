import { apiClient } from "@/services/api-client";
import { authHeader } from "@/utils/auth";
import type {
  CreateOrderRequest,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
  OrderResponse,
} from "@/types/order";
import type { PageResponse, SearchRequest } from "@/types/search";

export const orderService = {
  async getOrderById(orderId: number): Promise<OrderResponse> {
    return apiClient<OrderResponse>(`/api/orders/${orderId}`, {
      method: "GET",
      headers: authHeader(),
    });
  },


  async createOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    const requestBody = {
      tableId: payload.tableId,
      numberOfGuests: payload.numberOfGuests ?? undefined,
      note: payload.note?.trim() || undefined,
      items: payload.items.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
        note: item.note?.trim() || undefined,
      })),
    };

    return apiClient<OrderResponse>("/api/orders", {
      method: "POST",
      body: requestBody,
      headers: authHeader(),
    });
  },

  async updateOrder(orderId: number, payload: UpdateOrderRequest): Promise<OrderResponse> {
    const requestBody = {
      ...(payload.tableId !== undefined ? { tableId: payload.tableId } : {}),
      numberOfGuests: payload.numberOfGuests,
      note: payload.note,
      items: payload.items.map((item) => ({
        dishId: item.dishId,
        quantity: item.quantity,
        note: item.note,
      })),
    };

    return apiClient<OrderResponse>(`/api/orders/${orderId}`, {
      method: "PATCH",
      body: requestBody,
      headers: authHeader(),
    });
  },

  // RM-150: GET /api/orders (Phân trang và sắp xếp danh sách đơn hàng)
  async getOrders(params?: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<PageResponse<OrderResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.page != null) searchParams.append("page", params.page.toString());
    if (params?.size != null) searchParams.append("size", params.size.toString());
    if (params?.sort) searchParams.append("sort", params.sort);

    const query = searchParams.toString();
    return apiClient<PageResponse<OrderResponse>>(`/api/orders${query ? `?${query}` : ""}`, {
      method: "GET",
      headers: authHeader(),
    });
  },

  // RM-150: POST /api/orders/search (Tìm kiếm & Lọc kết hợp)
  async searchOrders(
    payload: SearchRequest,
    params?: { page?: number; size?: number }
  ): Promise<PageResponse<OrderResponse>> {
    const page = params?.page ?? 0;
    const size = params?.size ?? 10;

    return apiClient<PageResponse<OrderResponse>>(
      `/api/orders/search?page=${page}&size=${size}`,
      {
        method: "POST",
        body: payload,
        headers: authHeader(),
      }
    );
  },

  // RM-150: PATCH /api/orders/{id}/status (Cập nhật trạng thái đơn hàng)
  async updateOrderStatus(
    orderId: number,
    payload: UpdateOrderStatusRequest
  ): Promise<OrderResponse> {
    return apiClient<OrderResponse>(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },
};

