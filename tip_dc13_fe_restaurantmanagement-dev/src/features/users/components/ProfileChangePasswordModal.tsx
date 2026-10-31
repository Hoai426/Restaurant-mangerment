"use client";

import ProfileChangePasswordForm from "./ProfileChangePasswordForm";
import { Modal } from "@/components/ui/Modal";

export interface ProfileChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileChangePasswordModal({
  isOpen,
  onClose,
}: ProfileChangePasswordModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-xl"
      ariaLabelledBy="change-password-modal-title"
    >
      <ProfileChangePasswordForm
        onSuccess={onClose}
        onCancel={onClose}
      />
    </Modal>
  );
}
