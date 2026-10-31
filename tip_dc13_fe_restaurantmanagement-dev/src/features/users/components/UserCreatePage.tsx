"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import UserCreateForm from "./UserCreateForm";
import UserOtpVerification from "./UserOtpVerification";
import { useCreateUser } from "@/features/users/hooks/useCreateUser";
import type { CreateUserRequest } from "@/types/user";

import { useRequireAuth } from "@/hooks/useRequireAuth";

// Step type

type Step = "form" | "otp";
export default function UserCreatePage() {
  const router = useRouter();
  const { isAuthorized } = useRequireAuth(["ADMIN"]);

  const [step, setStep] = useState<Step>("form");
  const [tempToken, setTempToken] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [formData, setFormData] = useState<CreateUserRequest | null>(null);

  const createUser = useCreateUser({
    onSuccess: (result, email) => {
      setTempToken(result.tempToken);
      setSubmittedEmail(email);
      setStep("otp");
    },
  });

  const handleFormSubmit = (data: CreateUserRequest) => {
    setFormData(data);
    createUser.mutate(data);
  };

  if (isAuthorized !== true) {
    return null;
  }

  const handleVerifySuccess = () => {
    router.push("/dashboard/users");
  };

  const handleBackToForm = () => {
    // Return to Step 1; clear any stale OTP session data, keep entered form data
    setTempToken("");
    setSubmittedEmail("");
    setStep("form");
  };

  const handleCancel = () => {
    router.push("/dashboard/users");
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Step 1: Form */}
      <div className={step === "form" ? "block" : "hidden"}>
        <UserCreateForm
          initialData={formData ?? undefined}
          serverFieldErrors={createUser.fieldErrors}
          errorMessage={createUser.errorMessage}
          isPending={createUser.isPending}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </div>

      {/* Step 2: OTP verification */}
      {step === "otp" && (
        <UserOtpVerification
          email={submittedEmail}
          tempToken={tempToken}
          onSuccess={handleVerifySuccess}
          onBack={handleBackToForm}
        />
      )}
    </div>
  );
}
