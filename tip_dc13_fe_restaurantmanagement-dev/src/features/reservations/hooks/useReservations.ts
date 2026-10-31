import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { reservationService } from "../services/reservation.service";
import type { SearchRequest, PageResponse } from "@/types/search";
import type { ReservationResponse } from "@/types/reservation";

export interface UseReservationsOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
}

export function useReservations(
  searchRequest: SearchRequest,
  options: UseReservationsOptions = {}
) {
  const { page = 0, size = 10, enabled = true } = options;

  return useQuery<PageResponse<ReservationResponse>, Error>({
    queryKey: ["reservations", "search", searchRequest, { page, size }],
    queryFn: () =>
      reservationService.searchReservations(searchRequest, { page, size }),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export default useReservations;
