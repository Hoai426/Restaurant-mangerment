import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../services/user.service";
import type { UserUpdateProfileRequest, UserUpdateProfileResponse } from "@/types/user";

interface UseUpdateProfileOptions {
  onSuccess?: (data: UserUpdateProfileResponse) => void;
  onError?: (err: Error) => void;
}

export function useUpdateProfile(options?: UseUpdateProfileOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserUpdateProfileRequest) =>
      userService.updateProfile(data),
    onSuccess: async (data) => {
      // Invalidate the profile query to refetch fresh data only if no email OTP is pending
      if (!data?.emailChangeTempToken && !data?.emailPendingVerification) {
        await queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      }
      options?.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options?.onError?.(err);
    },
  });
}
