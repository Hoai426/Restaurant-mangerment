import { apiClient } from "@/services/api-client";
import { authHeader } from "@/utils/auth";
import type {
  User,
  CreateUserRequest,
  CreateUserResponse,
  VerifyUserCreationRequest,
  ResendUserCreationOtpRequest,
  UserUpdateProfileRequest,
  UserUpdateProfileResponse,
  VerifyEmailChangeRequest,
  ResendEmailChangeOtpRequest,
  ResendEmailChangeOtpResponse,
  UserUpdateRequest,
  UpdateUserStatusRequest,
} from "@/types/user";

// Internal shape — backend sends `active`, FE domain uses `isActive`
interface UserApiResponse extends Omit<User, "isActive"> {
  active: boolean;
}

interface PageResponse<T> {
  content: T[];
}

function mapUserResponse(raw: UserApiResponse): User {
  const { active, ...rest } = raw;
  return { ...rest, isActive: active };
}


export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient<
      UserApiResponse[] | PageResponse<UserApiResponse>
    >("/api/users", { headers: authHeader() });

    return "content" in response
      ? response.content.map(mapUserResponse)
      : response.map(mapUserResponse);
  },

  async getUserById(id: number): Promise<User> {
    const raw = await apiClient<UserApiResponse>(`/api/users/${id}`, {
      headers: authHeader(),
    });
    return mapUserResponse(raw);
  },

  async getMyProfile(): Promise<User> {
    const raw = await apiClient<UserApiResponse>("/api/users/me", {
      headers: authHeader(),
    });
    return mapUserResponse(raw);
  },

  async updateProfile(
    data: UserUpdateProfileRequest
  ): Promise<UserUpdateProfileResponse> {
    const raw = await apiClient<UserApiResponse | UserUpdateProfileResponse>(
      "/api/users/me",
      {
        method: "PATCH",
        body: data,
        headers: authHeader(),
      }
    );

    if (
      "emailChangeTempToken" in raw ||
      "emailPendingVerification" in raw
    ) {
      return raw as UserUpdateProfileResponse;
    }

    return mapUserResponse(raw as UserApiResponse);
  },

  /**
   * Verify email change OTP after profile update.
   */
  async verifyEmailChange(data: VerifyEmailChangeRequest): Promise<User> {
    const raw = await apiClient<UserApiResponse>("/api/users/me/email/verify", {
      method: "POST",
      body: data,
      headers: authHeader(),
    });
    return mapUserResponse(raw);
  },

  /**
   * Resend email change OTP.
   */
  async resendEmailChangeOtp(
    data: ResendEmailChangeOtpRequest
  ): Promise<ResendEmailChangeOtpResponse> {
    return await apiClient<ResendEmailChangeOtpResponse>(
      "/api/users/me/email/resend",
      {
        method: "POST",
        body: data,
        headers: authHeader(),
      }
    );
  },

  async updateUser(id: number, data: UserUpdateRequest): Promise<User> {
    const raw = await apiClient<UserApiResponse>(`/api/users/${id}`, {
      method: "PATCH",
      body: data,
      headers: authHeader(),
    });
    return mapUserResponse(raw);
  },

  async updateUserStatus(id: number, data: UpdateUserStatusRequest): Promise<User> {
    const raw = await apiClient<UserApiResponse>(`/api/users/${id}/status`, {
      method: "PATCH",
      body: data,
      headers: authHeader(),
    });
    return mapUserResponse(raw);
  },

  /**
   * RM-14 Step 1: Initiate user creation.
   * Backend validates data, sends a 6-digit OTP to the provided email,
   * and returns a tempToken to identify this pending creation session.
   */
  async createUser(data: CreateUserRequest): Promise<CreateUserResponse> {
    return await apiClient<CreateUserResponse>("/api/users", {
      method: "POST",
      body: data,
      headers: authHeader(),
    });
  },

  /**
   * RM-14 Step 2: Verify the OTP and activate the account.
   * Returns the fully created User once OTP is accepted.
   */
  async verifyUserCreation(data: VerifyUserCreationRequest): Promise<User> {
    const raw = await apiClient<UserApiResponse>("/api/users/create/verify", {
      method: "POST",
      body: data,
      headers: authHeader(),
    });
    return mapUserResponse(raw);
  },


  async resendUserCreationOtp(
    data: ResendUserCreationOtpRequest
  ): Promise<CreateUserResponse> {
    return await apiClient<CreateUserResponse>("/api/users/create/resend", {
      method: "POST",
      body: data,
      headers: authHeader(),
    });
  },
};