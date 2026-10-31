import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationService } from "../services/reservation.service";
import { RESERVATION_STATUS_ACTION_CONFIG } from "../constants/reservation.constants";
import type {
  ReservationUpdateStatusRequest,
  ReservationResponse,
} from "@/types/reservation";

export interface UseUpdateReservationStatusOptions {
  onSuccess?: (data: ReservationResponse[]) => void;
  onError?: (err: unknown) => void;
}

export function useUpdateReservationStatus(
  options?: UseUpdateReservationStatusOptions
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ReservationUpdateStatusRequest;
    }) => reservationService.updateReservationStatus(id, payload),
    onSuccess: (data, variables) => {
      // 1. Luôn invalidate reservations cache (danh sách và chi tiết)
      queryClient.invalidateQueries({ queryKey: ["reservations"] });

      // 2. Chỉ invalidate tables cache khi chuyển sang trạng thái terminal
      // (Backend chỉ gọi tableService.markAvailable khi CANCELLED, COMPLETED, hoặc NO_SHOW)
      const targetStatus = variables.payload.status;
      if (RESERVATION_STATUS_ACTION_CONFIG[targetStatus]?.isTerminal) {
        queryClient.invalidateQueries({ queryKey: ["tables"] });
      }

      options?.onSuccess?.(data);
    },
    onError: (err) => {
      options?.onError?.(err);
    },
  });
}

export default useUpdateReservationStatus;
