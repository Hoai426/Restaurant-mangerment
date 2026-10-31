import { apiClient } from "@/services/api-client";
import { authHeader } from "@/utils/auth";
import type {
  Room,
  RoomCategory,
  RoomCreateRequest,
  RoomUpdateRequest,
  RoomUpdateStatusRequest,
  RoomCategoryUpdateStatusRequest,
  SearchRequest,
  PageResponse,
} from "@/types/room";

export const roomService = {
  async searchRooms(
    payload: SearchRequest,
    { page = 0, size = 2000 }: { page?: number; size?: number } = {}
  ): Promise<Room[]> {
    const pageResponse = await apiClient<PageResponse<Room>>(
      `/api/rooms/search?page=${page}&size=${size}`,
      {
        method: "POST",
        body: payload,
        headers: authHeader(),
      }
    );
    return pageResponse.content ?? [];
  },

  async createRoom(payload: RoomCreateRequest): Promise<Room> {
    return apiClient<Room>("/api/rooms", {
      method: "POST",
      body: payload,
      headers: authHeader(),
    });
  },

  async updateRoom(id: number, payload: RoomUpdateRequest): Promise<Room> {
    return apiClient<Room>(`/api/rooms/${id}`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },

  async updateRoomStatus(
    id: number,
    payload: RoomUpdateStatusRequest
  ): Promise<Room> {
    return apiClient<Room>(`/api/rooms/${id}/status`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },

  async updateRoomCategoryStatus(
    id: number,
    payload: RoomCategoryUpdateStatusRequest
  ): Promise<RoomCategory> {
    return apiClient<RoomCategory>(`/api/room-categories/${id}/status`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },

  async getRoomCategories(): Promise<RoomCategory[]> {
    return apiClient<RoomCategory[]>("/api/room-categories", {
      headers: authHeader(),
    });
  },

  async getRooms(): Promise<Room[]> {
    return apiClient<Room[]>("/api/rooms", {
      headers: authHeader(),
    });
  },

  async getRoomById(id: number): Promise<Room> {
    return apiClient<Room>(`/api/rooms/${id}`, {
      headers: authHeader(),
    });
  },
};
