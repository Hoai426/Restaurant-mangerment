"use client";

import UserProfileForm from "@/features/users/components/UserProfileForm";
import { useMyProfile } from "@/features/users/hooks/useMyProfile";
import { IconSpinner } from "@/components/common/IconSpinner";

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useRouter } from "next/navigation";
import { getRoleBasedRedirect } from "@/utils/auth";

export default function MyProfilePage() {
  useRequireAuth();
  const router = useRouter();
  const { data: user, isLoading: isFetching, error: fetchError } = useMyProfile();

  if (isFetching) {
    return (
      <div className="flex-1 w-full min-h-screen bg-rms-cream flex flex-col items-center justify-center py-32 text-gray-400">
        <IconSpinner />
        <p className="mt-4 text-sm font-medium">Đang tải thông tin cá nhân...</p>
      </div>
    );
  }

  if (fetchError || !user) {
    return (
      <div className="flex-1 w-full min-h-screen bg-rms-cream flex flex-col items-center justify-center py-32 text-red-500">
        <p className="text-sm font-medium">Không thể tải thông tin. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex items-center justify-center min-h-screen p-4 sm:p-6 bg-rms-cream">
      <div className="w-full max-w-3xl">
        <UserProfileForm
          user={user}
          onCancel={() => router.push(getRoleBasedRedirect(user.role))}
        />
      </div>
    </div>
  );
}
