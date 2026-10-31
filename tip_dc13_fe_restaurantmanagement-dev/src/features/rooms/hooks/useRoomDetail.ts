import { useQuery } from "@tanstack/react-query";
import { roomService } from "../services/room.service";
import type { Room } from "@/types/room";

export function useRoomDetail(id: number | null) {
  return useQuery<Room, Error>({
    queryKey: ["rooms", id],
    queryFn: () => {
      if (typeof id !== "number" || id <= 0) {
        throw new Error("Room ID is required");
      }
      return roomService.getRoomById(id);
    },
    enabled: typeof id === "number" && id > 0,
  });
}

export default useRoomDetail;
