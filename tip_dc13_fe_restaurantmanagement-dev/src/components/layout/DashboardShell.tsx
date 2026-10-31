import React from "react";
import Topbar from "@/components/layout/Topbar";

interface DashboardShellProps {
  sidebar: React.ReactNode;
  topbar?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardShell({
  sidebar,
  topbar,
  children,
}: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-rms-cream overflow-hidden font-sans">
      {/* Sidebar */}
      {sidebar}

      {/* Main Content */}
      <main className="relative flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        {topbar || <Topbar />}

        {/* Page Content */}
        <div className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-4">{children}</div>
      </main>
    </div>
  );
}
