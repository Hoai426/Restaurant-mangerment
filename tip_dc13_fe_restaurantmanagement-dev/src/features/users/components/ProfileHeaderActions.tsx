"use client";

import { useState } from "react";
import ProfileModal from "@/features/users/components/ProfileModal";
import ProfileChangePasswordModal from "@/features/users/components/ProfileChangePasswordModal";
import ProfileDropdown from "@/features/users/components/ProfileDropdown";
import { useMyProfile } from "@/features/users/hooks/useMyProfile";

export default function ProfileHeaderActions() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const { data: user } = useMyProfile();

  if (!user) return null;

  return (
    <>
      <ProfileDropdown
        user={user}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />

      {/* Change Password Modal */}
      <ProfileChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}

