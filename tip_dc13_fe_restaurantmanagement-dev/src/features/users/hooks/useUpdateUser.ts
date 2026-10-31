import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import type { UserUpdateRequest } from "@/types/user";

interface UseUpdateUserOptions {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export function useUpdateUser(options?: UseUpdateUserOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserUpdateRequest }) =>
      userService.updateUser(id, data),
    onSuccess: async (_, variables) => {
      // Invalidate the users list and the specific user query
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
      options?.onSuccess?.();
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
