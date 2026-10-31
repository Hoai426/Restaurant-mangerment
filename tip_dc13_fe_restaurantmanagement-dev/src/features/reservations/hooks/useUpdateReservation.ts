import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationService } from "../services/reservation.service";
import type {
  ReservationUpdateRequest,
  ReservationResponse,
} from "@/types/reservation";

export interface UseUpdateReservationOptions {
  onSuccess?: (data: ReservationResponse[]) => void;
  onError?: (err: unknown) => void;
}

export function useUpdateReservation(options?: UseUpdateReservationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string;
      payload: ReservationUpdateRequest;
    }) => reservationService.updateReservation(id, payload),
    onSuccess: (data) => {
      // Invalidate tables to refresh status (AVAILABLE <-> RESERVED)
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      // Invalidate reservations to refresh RM-99 detail query ["reservations", "detail", id]
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      options?.onSuccess?.(data);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}

export default useUpdateReservation;
