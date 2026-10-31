import type { UserRole } from "@/utils/auth";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  phone: string;
  password: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
}

/** Response from POST /api/users  */
export interface CreateUserResponse {
  tempToken: string;
}

/** Request body for POST /api/users/create/verify  */
export interface VerifyUserCreationRequest {
  tempToken: string;
  otpCode: string;
}

/** Request body for POST /api/users/create/resend */
export interface ResendUserCreationOtpRequest {
  tempToken: string;
}

/** Response from PATCH /api/users/me */
export interface UserUpdateProfileResponse {
  emailChangeTempToken?: string;
  emailPendingVerification?: boolean;
  id?: number;
  username?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Request body for POST /api/users/me/email/verify */
export interface VerifyEmailChangeRequest {
  tempToken: string;
  otpCode: string;
}

/** Request body for POST /api/users/me/email/resend */
export interface ResendEmailChangeOtpRequest {
  tempToken: string;
}

/** Response from POST /api/users/me/email/resend */
export interface ResendEmailChangeOtpResponse {
  tempToken?: string;
}

/** Request body for PATCH /api/users/me */
export interface UserUpdateProfileRequest {
  username?: string;
  email?: string;
  phone?: string;
  fullName?: string;
  currentPassword?: string;
  password?: string;
}

/** Request body for PATCH /api/users/{id} */
export interface UserUpdateRequest {
  email?: string;
  phone?: string;
  fullName?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

/** Request body for PATCH /api/users/{id}/status */
export interface UpdateUserStatusRequest {
  isActive: boolean;
}
