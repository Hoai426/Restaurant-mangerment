import { apiClient } from "@/services/api-client";
import { authHeader } from "@/utils/auth";
import type {
  ReservationCreateRequest,
  ReservationUpdateRequest,
  ReservationUpdateStatusRequest,
  ReservationResponse,
} from "@/types/reservation";
import type { SearchRequest, PageResponse } from "@/types/search";
import { isReservationEditable } from "../constants/reservation.constants";

export const reservationService = {
  async createReservation(
    payload: ReservationCreateRequest
  ): Promise<ReservationResponse[]> {
    return apiClient<ReservationResponse[]>("/api/reservations", {
      method: "POST",
      body: payload,
      headers: authHeader(),
    });
  },

  async getReservationDetail(
    id: number | string
  ): Promise<ReservationResponse[]> {
    return apiClient<ReservationResponse[]>(`/api/reservations/${id}`, {
      method: "GET",
      headers: authHeader(),
    });
  },

  async updateReservation(
    id: number | string,
    payload: ReservationUpdateRequest
  ): Promise<ReservationResponse[]> {
    return apiClient<ReservationResponse[]>(`/api/reservations/${id}`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },

  async updateReservationStatus(
    id: number,
    payload: ReservationUpdateStatusRequest
  ): Promise<ReservationResponse[]> {
    return apiClient<ReservationResponse[]>(`/api/reservations/${id}/status`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },

  async searchReservations(
    payload: SearchRequest,
    { page = 0, size = 20 }: { page?: number; size?: number } = {}
  ): Promise<PageResponse<ReservationResponse>> {
    return apiClient<PageResponse<ReservationResponse>>(
      `/api/reservations/search?page=${page}&size=${size}`,
      {
        method: "POST",
        body: payload,
        headers: authHeader(),
      }
    );
  },

  async getActiveReservationByTableId(
    tableId: number
  ): Promise<ReservationResponse | null> {
    const pageSize = 20;
    let currentPage = 0;

    while (true) {
      const pageResponse = await this.searchReservations(
        {
          filters: [
            { field: "table.id", operation: "EQ", value: tableId },
          ],
          sorts: [
            { field: "createdAt", direction: "DESC" },
          ],
        },
        { page: currentPage, size: pageSize }
      );

      // Defensive Guard: Ngăn chặn vòng lặp vô hạn nếu metadata bị thiếu hoặc không hợp lệ
      const hasValidPaginationMetadata =
        typeof pageResponse?.last === "boolean" ||
        typeof pageResponse?.totalPages === "number";

      if (!hasValidPaginationMetadata) {
        throw new Error(
          "Phản hồi từ máy chủ không hợp lệ: thiếu thông tin phân trang (last / totalPages)."
        );
      }

      const items = pageResponse?.content || [];
      const activeReservation = items.find((r) =>
        isReservationEditable(r.status)
      );

      // 1. Tìm thấy PENDING hoặc CONFIRMED -> trả về ngay
      if (activeReservation) {
        return activeReservation;
      }

      // 2. Kiểm tra trang cuối cùng dựa trên metadata backend
      const isLastPage =
        pageResponse.last === true ||
        (typeof pageResponse.totalPages === "number" &&
          currentPage + 1 >= pageResponse.totalPages) ||
        items.length === 0;

      if (isLastPage) {
        return null; // Đã duyệt hết tất cả các trang hợp lệ mà không có active reservation
      }

      // 3. Nếu còn trang thì chuyển sang trang kế tiếp
      currentPage++;
    }
  },
};

