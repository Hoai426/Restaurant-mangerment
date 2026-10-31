import { useQuery } from "@tanstack/react-query";
import { userService } from "../services/user.service";

export function useMyProfile() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => userService.getMyProfile(),
    // In a real app we might disable this if no token is found, but the api client handles 401.
  });
}
