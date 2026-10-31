import { useQuery } from "@tanstack/react-query";
import { tableService } from "../services/table.service";
import type { RestaurantTable } from "@/types/table";

export function useRoomTables(roomId: number | null | undefined) {
  return useQuery<RestaurantTable[], Error>({
    queryKey: ["tables", "room", roomId],
    queryFn: async () => {
      if (!roomId || roomId <= 0) return [];
      const allTables = await tableService.getTables();
      return allTables.filter((table) => table.roomId === roomId);
    },
    enabled: typeof roomId === "number" && roomId > 0,
  });
}

export default useRoomTables;
