"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserIcon, KeyIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { authService } from "@/features/auth";
import { clearAuthCookies } from "@/utils/auth";
import type { User } from "@/types/user";

export interface ProfileDropdownProps {
  user: User;
  onOpenProfile: () => void;
  onOpenChangePassword: () => void;
}

export default function ProfileDropdown({
  user,
  onOpenProfile,
  onOpenChangePassword,
}: ProfileDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    setIsOpen(false);
    onOpenProfile();
  };

  const handleChangePasswordClick = () => {
    setIsOpen(false);
    onOpenChangePassword();
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsOpen(false);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await authService.logout(refreshToken).catch(() => {});
      }
      clearAuthCookies();
      localStorage.removeItem("refreshToken");
      router.replace("/login");
    } catch {
      clearAuthCookies();
      localStorage.removeItem("refreshToken");
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 hover:bg-gray-50 pl-3 pr-1 py-1 rounded-full transition-colors border border-transparent hover:border-gray-200 focus:outline-none focus:ring-2 focus:ring-rms-burgundy/20"
        title="Tài khoản cá nhân"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[150px] truncate">
          {user.fullName || user.username}
        </span>
        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-tr from-rms-burgundy to-rms-gold p-0.5 shadow-sm">
          <div className="h-full w-full bg-white rounded-full flex items-center justify-center overflow-hidden text-rms-charcoal">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in"
        >
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-green-500 shrink-0"
                aria-hidden="true"
              />
              <p className="text-sm font-semibold text-gray-800 truncate">
                {user.fullName || user.username}
              </p>
            </div>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              onClick={handleProfileClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-rms-burgundy transition-colors text-left"
            >
              <UserIcon className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Hồ sơ của tôi</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleChangePasswordClick}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-rms-burgundy transition-colors text-left"
            >
              <KeyIcon className="w-4 h-4 text-gray-500 shrink-0" />
              <span>Đổi mật khẩu</span>
            </button>

            <div className="border-t border-gray-100 my-1" />

            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4 text-red-500 shrink-0" />
              <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
