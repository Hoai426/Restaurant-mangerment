export { userService } from "./services/user.service";
export * from "./types";
export { useCreateUser } from "./hooks/useCreateUser";
export { useUpdateProfile } from "./hooks/useUpdateProfile";

// Shared OTP hooks — use these instead of the deleted per-flow hooks.
export { useVerifyOtp } from "./hooks/useVerifyOtp";
export { useResendOtp } from "./hooks/useResendOtp";
