import { useQuery } from "@tanstack/react-query";
import { roomService } from "../services/room.service";
import type { SearchRequest } from "@/types/search";

export function useRooms(searchRequest?: SearchRequest) {
  const request: SearchRequest = searchRequest ?? {};
  return useQuery({
    queryKey: ["rooms", "search", request],
    queryFn: () => roomService.searchRooms(request),
  });
}
