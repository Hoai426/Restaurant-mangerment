"use client";

import React, { useState, useRef, useEffect, ReactNode } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

export interface MultiSelectOption<T> {
  value: T;
  label: string;
}

export interface MultiSelectProps<T> {
  options: MultiSelectOption<T>[];
  selectedValues: T[];
  onChange: (values: T[]) => void;
  icon?: ReactNode;
  disabled?: boolean;
  hasError?: boolean;
  className?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptySearchMessage?: string;
  id?: string;
  "aria-describedby"?: string;
}

export function MultiSelect<T extends string | number>({
  options,
  selectedValues,
  onChange,
  icon,
  disabled = false,
  hasError = false,
  className = "",
  placeholder = "Chọn một hoặc nhiều danh mục...",
  searchPlaceholder = "Tìm kiếm...",
  emptySearchMessage = "Không tìm thấy kết quả phù hợp",
  id,
  "aria-describedby": ariaDescribedBy,
}: MultiSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const listboxId = id ? `${id}-listbox` : "multiselect-listbox";

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (prev) {
        setSearchQuery("");
      }
      return !prev;
    });
  };

  // Close on click outside or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      searchInputRef.current?.focus();
    }
  }, [isOpen]);

  const handleToggle = (val: T) => {
    if (disabled) return;
    const isSelected = selectedValues.includes(val);
    const updated = isSelected
      ? selectedValues.filter((v) => v !== val)
      : [...selectedValues, val];
    onChange(updated);
  };

  const handleRemove = (e: React.MouseEvent, val: T) => {
    e.stopPropagation();
    if (disabled) return;
    onChange(selectedValues.filter((v) => v !== val));
  };

  const selectedOptions = options.filter((opt) =>
    selectedValues.includes(opt.value)
  );

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Box */}
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-describedby={ariaDescribedBy}
        onClick={toggleDropdown}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleDropdown();
          }
        }}
        className={`min-h-[46px] w-full px-3 py-2 bg-white border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all duration-200 ${
          hasError
            ? "border-red-500 ring-2 ring-red-500/10"
            : isOpen
            ? "border-rms-burgundy ring-3 ring-rms-burgundy/10 shadow-xs"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "bg-gray-50 opacity-60 cursor-not-allowed" : ""}`}
      >
        <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
          {icon && <span className="text-gray-400 shrink-0 mr-1">{icon}</span>}

          {selectedOptions.length === 0 ? (
            <span className="text-sm text-gray-400 select-none">
              {placeholder}
            </span>
          ) : (
            selectedOptions.map((opt) => (
              <span
                key={String(opt.value)}
                className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-lg text-xs font-semibold bg-rms-burgundy/10 text-rms-burgundy border border-rms-burgundy/20 max-w-[200px]"
                title={opt.label}
              >
                <span className="truncate">{opt.label}</span>
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => handleRemove(e, opt.value)}
                  className="p-0.5 hover:bg-rms-burgundy/20 rounded-md text-rms-burgundy transition-colors cursor-pointer"
                  aria-label={`Xóa ${opt.label}`}
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0 pl-1 text-gray-400">
          <ChevronDownIcon
            className={`w-5 h-5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-rms-burgundy" : ""
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-40 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fade-in">
          {/* Search Box */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/50">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-rms-burgundy focus:ring-1 focus:ring-rms-burgundy/20 text-gray-800 placeholder-gray-400"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Options List */}
          <ul
            id={listboxId}
            role="listbox"
            aria-multiselectable="true"
            className="max-h-52 overflow-y-auto py-1 divide-y divide-gray-50 text-sm"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-center text-xs text-gray-400">
                {emptySearchMessage}
              </li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <li
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleToggle(opt.value)}
                    className={`px-3 py-2 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-rms-burgundy/5 text-rms-burgundy font-medium"
                        : "text-gray-700 hover:bg-gray-50 hover:text-rms-burgundy"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isSelected
                            ? "bg-rms-burgundy border-rms-burgundy text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <CheckIcon className="w-3 h-3 stroke-[3]" />
                        )}
                      </div>
                      <span className="truncate text-xs sm:text-sm" title={opt.label}>
                        {opt.label}
                      </span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default MultiSelect;
