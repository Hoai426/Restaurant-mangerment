import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import type { UpdateUserStatusRequest, User } from "@/types/user";

interface UseUpdateUserStatusOptions {
  onSuccess?: (data: User) => void;
  onError?: (err: Error) => void;
}

export function useUpdateUserStatus(options?: UseUpdateUserStatusOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserStatusRequest }) =>
      userService.updateUserStatus(id, data),
    onSuccess: async (data, variables) => {
      // Invalidate the users list and the specific user query
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
