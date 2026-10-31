import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationService } from "../services/reservation.service";
import type {
  ReservationCreateRequest,
  ReservationResponse,
} from "@/types/reservation";

export interface UseCreateReservationOptions {
  onSuccess?: (data: ReservationResponse[]) => void;
  onError?: (err: unknown) => void;
}

export function useCreateReservation(options?: UseCreateReservationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ReservationCreateRequest) =>
      reservationService.createReservation(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      options?.onSuccess?.(data);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}

export default useCreateReservation;
