import { useQuery } from "@tanstack/react-query";
import { roomService } from "../services/room.service";

export function useRoomCategories() {
  return useQuery({
    queryKey: ["room-categories"],
    queryFn: () => roomService.getRoomCategories(),
  });
}
