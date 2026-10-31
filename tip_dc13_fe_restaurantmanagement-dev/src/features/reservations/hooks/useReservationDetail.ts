import { useQuery } from "@tanstack/react-query";
import { reservationService } from "../services/reservation.service";
import type { ReservationResponse } from "@/types/reservation";

export interface UseReservationDetailOptions {
  enabled?: boolean;
}

export function useReservationDetail(
  id: number | string | null | undefined,
  options?: UseReservationDetailOptions
) {
  const isEnabled =
    options?.enabled !== undefined
      ? options.enabled && Boolean(id)
      : Boolean(id);

  return useQuery<ReservationResponse[]>({
    queryKey: ["reservations", "detail", id],
    queryFn: () => reservationService.getReservationDetail(id as number | string),
    enabled: isEnabled,
  });
}

export default useReservationDetail;
