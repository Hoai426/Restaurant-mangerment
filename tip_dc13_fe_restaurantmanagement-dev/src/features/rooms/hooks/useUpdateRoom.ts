import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "../services/room.service";
import type { Room, RoomUpdateRequest } from "@/types/room";

export interface UpdateRoomVariables {
  id: number;
  payload: RoomUpdateRequest;
}

export interface UseUpdateRoomOptions {
  onSuccess?: (data: Room) => void;
  onError?: (err: Error) => void;
}

export function useUpdateRoom(options?: UseUpdateRoomOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: UpdateRoomVariables) =>
      roomService.updateRoom(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
