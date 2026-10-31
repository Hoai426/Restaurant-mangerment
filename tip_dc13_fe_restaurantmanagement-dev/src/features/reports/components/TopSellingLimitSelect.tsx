"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const TOP_SELLING_LIMIT_OPTIONS = Array.from({ length: 20 }, (_, index) => index + 1);
const TOP_SELLING_MENU_WIDTH = 112;

interface TopSellingLimitSelectProps {
  value: number;
  onChange: (value: number) => void;
}

export function TopSellingLimitSelect({ value, onChange }: TopSellingLimitSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(value - 1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, maxHeight: 0 });

  useEffect(() => {
    if (isOpen) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target) && !listboxRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const updateMenuPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const desiredHeight = listboxRef.current?.scrollHeight ?? TOP_SELLING_LIMIT_OPTIONS.length * 24 + 8;
      const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - 12);
      const spaceAbove = Math.max(0, rect.top - 12);
      const openAbove = spaceBelow < desiredHeight && spaceAbove > spaceBelow;
      const maxHeight = Math.min(desiredHeight, openAbove ? spaceAbove : spaceBelow);
      setMenuPosition({
        top: openAbove ? rect.top - maxHeight - 4 : rect.bottom + 4,
        left: Math.max(8, Math.min(rect.right - TOP_SELLING_MENU_WIDTH, window.innerWidth - TOP_SELLING_MENU_WIDTH - 8)),
        maxHeight,
      });
    };

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  const openAt = (index: number) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const selectOption = (option: number) => {
    onChange(option);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAt(value - 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt(value - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      openAt(0);
    } else if (event.key === "End") {
      event.preventDefault();
      openAt(TOP_SELLING_LIMIT_OPTIONS.length - 1);
    }
  };

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const offset = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + offset + TOP_SELLING_LIMIT_OPTIONS.length) % TOP_SELLING_LIMIT_OPTIONS.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : TOP_SELLING_LIMIT_OPTIONS.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(TOP_SELLING_LIMIT_OPTIONS[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative z-30">
      <button
        ref={triggerRef}
        id="top-selling-limit"
        type="button"
        aria-label="Chọn số món hiển thị"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="top-selling-limit-listbox"
        onClick={() => isOpen ? setIsOpen(false) : openAt(value - 1)}
        onKeyDown={handleTriggerKeyDown}
        className={`flex h-8 w-28 cursor-pointer items-center justify-between gap-2 rounded-lg border bg-white px-2.5 text-xs font-medium text-rms-charcoal transition-colors focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 ${isOpen ? "border-rms-gold" : "border-gray-200 hover:border-rms-gold"}`}
      >
        <span>{value} món</span>
        <ChevronDownIcon aria-hidden="true" className={`h-4 w-4 shrink-0 text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && createPortal(
        <div
          ref={listboxRef}
          id="top-selling-limit-listbox"
          role="listbox"
          aria-label="Số món hiển thị"
          onKeyDown={handleListKeyDown}
          style={{ top: menuPosition.top, left: menuPosition.left, maxHeight: menuPosition.maxHeight }}
          className="fixed z-[100] w-28 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
        >
          {TOP_SELLING_LIMIT_OPTIONS.map((option, index) => {
            const isSelected = option === value;
            const isActive = index === activeIndex;

            return (
              <div
                key={option}
                ref={(element) => { optionRefs.current[index] = element; }}
                role="option"
                tabIndex={isActive ? 0 : -1}
                aria-selected={isSelected}
                onFocus={() => setActiveIndex(index)}
                onMouseMove={() => setActiveIndex(index)}
                onClick={() => selectOption(option)}
                className={`flex cursor-pointer items-center gap-2 px-2.5 py-1 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rms-gold/50 ${
                  isSelected
                    ? "bg-red-50/80 font-semibold text-rms-burgundy"
                    : "text-rms-charcoal hover:bg-gray-50 hover:text-rms-burgundy"
                }`}
              >
                <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${isSelected ? "bg-rms-burgundy" : "bg-gray-300"}`} />
                <span className="whitespace-nowrap">{option} món</span>
              </div>
            );
          })}
        </div>,
        document.body,
      )}
    </div>
  );
}

export default TopSellingLimitSelect;
