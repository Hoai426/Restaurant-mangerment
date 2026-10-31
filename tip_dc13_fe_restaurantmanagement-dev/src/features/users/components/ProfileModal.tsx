"use client";

import type { User } from "@/types/user";
import UserProfileForm from "./UserProfileForm";
import { Modal } from "@/components/ui/Modal";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-3xl"
    >
      <UserProfileForm user={user} onCancel={onClose} />
    </Modal>
  );
}
