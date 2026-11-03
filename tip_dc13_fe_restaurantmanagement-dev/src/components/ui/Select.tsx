"use client";

import React, { useState, useRef, useEffect, ReactNode, useCallback } from "react";
import { ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline";

export interface SelectOption<T> {
  value: T;
  label: string;
}

export interface SelectProps<T> {
  options: SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  icon?: ReactNode;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
  "aria-describedby"?: string;
}

export function Select<T>({
  options,
  value,
  onChange,
  icon,
  disabled = false,
  hasError = false,
  className = "",
  placeholder = "Chọn...",
  id,
  "aria-describedby": ariaDescribedBy,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const selectedIndex = options.findIndex((opt) => opt.value === value);
  const selectedOption = options[selectedIndex];

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  const openDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
  }, [disabled, selectedIndex]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        (buttonRef.current && buttonRef.current.contains(target)) ||
        (listboxRef.current && listboxRef.current.contains(target))
      ) {
        return;
      }
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const item = listboxRef.current.children[highlightedIndex] as HTMLElement | undefined;
      item?.scrollIntoView({ block: "nearest" });
    }
  }, [isOpen, highlightedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openDropdown();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1));
        break;
      case "Home":
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case "End":
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (highlightedIndex >= 0 && options[highlightedIndex]) {
          onChange(options[highlightedIndex].value);
          closeDropdown();
        }
        break;
      case "Escape":
      case "Tab":
        closeDropdown();
        break;
    }
  };

  const listboxId = id ? `${id}-listbox` : "select-listbox";

  return (
    <div className="relative w-full h-full min-w-0">
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-describedby={ariaDescribedBy}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0 ? `${listboxId}-opt-${highlightedIndex}` : undefined
        }
        disabled={disabled}
        onClick={() => (isOpen ? closeDropdown() : openDropdown())}
        onKeyDown={handleKeyDown}
        className={`w-full h-full flex items-center justify-between px-3 py-2 text-left bg-white border rounded-xl text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-rms-gold/30 focus:border-rms-gold ${
          hasError ? "border-red-500" : isOpen ? "border-rms-burgundy ring-2 ring-rms-burgundy/10" : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "bg-gray-50 opacity-60 cursor-not-allowed" : "cursor-pointer"} ${className}`}
      >
        <div className="flex items-center min-w-0 gap-2 pr-2">
          {icon && <span className="text-gray-400 shrink-0">{icon}</span>}
          <span className={`truncate text-sm ${!selectedOption ? "text-gray-400" : "text-gray-900 font-medium"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDownIcon
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-rms-burgundy" : ""
          }`}
          strokeWidth={2}
        />
      </button>

      {isOpen && !disabled && (
        <ul
          ref={listboxRef}
          role="listbox"
          id={listboxId}
          aria-label={placeholder}
          tabIndex={-1}
          className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 max-h-56 overflow-y-auto animate-fade-in divide-y divide-gray-50"
        >
          {options.length === 0 ? (
            <li className="px-4 py-2.5 text-xs text-gray-400 text-center">Không có tùy chọn</li>
          ) : (
            options.map((option, idx) => {
              const isSelected = option.value === value;
              const isHighlighted = idx === highlightedIndex;

              return (
                <li
                  key={idx}
                  id={`${listboxId}-opt-${idx}`}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    closeDropdown();
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2.5 text-xs sm:text-sm cursor-pointer transition-colors flex items-center justify-between ${
                    isHighlighted
                      ? "bg-red-50/70 text-rms-burgundy"
                      : isSelected
                      ? "bg-gray-50 text-rms-burgundy font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <CheckIcon className="w-4 h-4 text-rms-burgundy shrink-0 ml-2" />}
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export default Select;
