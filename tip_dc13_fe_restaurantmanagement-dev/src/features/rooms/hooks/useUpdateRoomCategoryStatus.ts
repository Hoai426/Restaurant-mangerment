import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "../services/room.service";
import type { RoomCategory, RoomCategoryUpdateStatusRequest } from "@/types/room";

export interface UpdateRoomCategoryStatusVariables {
  id: number;
  payload: RoomCategoryUpdateStatusRequest;
}

export interface UseUpdateRoomCategoryStatusOptions {
  onSuccess?: (data: RoomCategory) => void;
  onError?: (err: Error) => void;
}

export function useUpdateRoomCategoryStatus(options?: UseUpdateRoomCategoryStatusOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateRoomCategoryStatusVariables) =>
      roomService.updateRoomCategoryStatus(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["room-categories"] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
