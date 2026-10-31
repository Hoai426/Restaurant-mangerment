"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  BuildingStorefrontIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { IconSpinner } from "@/components/common/IconSpinner";

import { UserRole } from "@/utils/auth";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: UserRole[];
}

export interface SidebarProps {
  navItems: NavItem[];
  onLogout: () => void;
  isLoggingOut: boolean;
}

export default function Sidebar({
  navItems,
  onLogout,
  isLoggingOut,
}: SidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuCloseButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktopViewport = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => {
      if (desktopViewport.matches) setIsMobileMenuOpen(false);
    };

    desktopViewport.addEventListener("change", closeOnDesktop);
    return () => desktopViewport.removeEventListener("change", closeOnDesktop);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const menu = document.getElementById("dashboard-navigation");
    const mobileMenuButton = mobileMenuButtonRef.current;
    const focusableElements = menu?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled])'
    );
    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];
    const mainContent = document.querySelector("main");

    if (mainContent) mainContent.inert = true;
    mobileMenuButton?.setAttribute("inert", "");
    mobileMenuCloseButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }

      if (event.key === "Tab" && firstElement && lastElement) {
        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (mainContent) mainContent.inert = false;
      mobileMenuButton?.removeAttribute("inert");
      if (mobileMenuButton?.getClientRects().length) {
        mobileMenuButton.focus();
      } else {
        menu?.querySelector<HTMLElement>("a[href]")?.focus();
      }
    };
  }, [isMobileMenuOpen]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        type="button"
        ref={mobileMenuButtonRef}
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="Mở menu điều hướng"
        aria-controls="dashboard-navigation"
        aria-expanded={isMobileMenuOpen}
        className="fixed left-4 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-rms-burgundy shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/50 lg:hidden"
      >
        <Bars3Icon className="h-5 w-5" />
      </button>

      {isMobileMenuOpen && (
        <div
          aria-hidden="true"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden"
        />
      )}

      <aside
        id="dashboard-navigation"
        role={isMobileMenuOpen ? "dialog" : undefined}
        aria-modal={isMobileMenuOpen ? true : undefined}
        aria-label={isMobileMenuOpen ? "Menu điều hướng" : undefined}
        className={`${isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50 flex lg:static lg:z-20" : "hidden lg:flex lg:static lg:z-20"} h-screen w-64 shrink-0 flex-col justify-between overflow-y-auto overscroll-contain bg-rms-burgundy shadow-xl`}
      >
      {/* Brand */}
      <div>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-xl bg-rms-gold flex items-center justify-center text-white shadow-md mr-3">
              <BuildingStorefrontIcon className="w-6 h-6" strokeWidth={1.8} />
            </div>
            <div>
              <p className="font-bold text-white tracking-wider text-sm uppercase">
                RESTAURANT
              </p>
              <p className="text-xs text-rms-gold font-semibold">MANAGEMENT</p>
            </div>
          </div>
          <button
            type="button"
            ref={mobileMenuCloseButtonRef}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Đóng menu điều hướng"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 lg:hidden"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav aria-label="Điều hướng chính" className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  active
                    ? "bg-white/15 text-white font-semibold shadow-inner border border-white/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <span
                  className={`mr-3 transition-colors ${
                    active ? "text-rms-gold" : "group-hover:text-rms-gold"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center px-4 py-3 text-white/70 hover:text-red-300 hover:bg-white/5 rounded-xl transition-all duration-200 group disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <span className="mr-3 group-hover:text-red-300 transition-colors">
            {isLoggingOut ? (
              <IconSpinner />
            ) : (
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            )}
          </span>
          <span className="font-medium text-sm">
            {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
          </span>
        </button>
      </div>
      </aside>
    </>
  );
}
