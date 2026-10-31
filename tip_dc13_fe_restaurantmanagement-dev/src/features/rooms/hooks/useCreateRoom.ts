import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomService } from "../services/room.service";
import type { Room, RoomCreateRequest } from "@/types/room";

export interface UseCreateRoomOptions {
  onSuccess?: (data: Room) => void;
  onError?: (err: Error) => void;
}

export function useCreateRoom(options?: UseCreateRoomOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RoomCreateRequest) => roomService.createRoom(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
