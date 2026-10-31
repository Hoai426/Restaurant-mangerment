import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "../services/room.service";
import type { Room, RoomUpdateStatusRequest } from "@/types/room";

export interface UpdateRoomStatusVariables {
  id: number;
  payload: RoomUpdateStatusRequest;
}

export interface UseUpdateRoomStatusOptions {
  onSuccess?: (data: Room) => void;
  onError?: (err: Error) => void;
}

export function useUpdateRoomStatus(options?: UseUpdateRoomStatusOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateRoomStatusVariables) =>
      roomService.updateRoomStatus(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
