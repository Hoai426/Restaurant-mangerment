"use client";

import React from "react";
import ProfileHeaderActions from "@/features/users/components/ProfileHeaderActions";

export default function Topbar() {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 flex items-center justify-end px-4 sm:px-6 lg:px-8 z-10">
      <div className="flex items-center space-x-4">
        <ProfileHeaderActions />
      </div>
    </header>
  );
}
