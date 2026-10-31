import React, { useState, useRef, useEffect, ReactNode } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

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
  disabled,
  hasError,
  className = "",
  placeholder = "Chọn...",
  id,
  "aria-describedby": ariaDescribedBy,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={id ? `${id}-listbox` : undefined}
        aria-describedby={ariaDescribedBy}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full h-full absolute inset-0 opacity-0 cursor-pointer ${disabled ? "cursor-not-allowed" : ""}`}
      />
      <div
        className={`rms-field__input flex items-center pr-10 select-none pointer-events-none min-w-0 ${
          hasError ? "border-red-500" : ""
        } ${!selectedOption ? "text-gray-400" : ""} ${className}`}
      >
        {icon && <span className="mr-2 text-gray-400 shrink-0">{icon}</span>}
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
      </div>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-rms-burgundy" : ""}`}
          strokeWidth={2}
        />
      </div>

      {isOpen && !disabled && (
        <ul 
          ref={listboxRef}
          className="absolute top-full left-0 right-0 mt-1.5 z-30 bg-white border border-gray-100 rounded-xl shadow-xl py-1.5 max-h-56 overflow-y-auto"
          role="listbox"
          id={id ? `${id}-listbox` : undefined}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            return (
              <li
                key={idx}
                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  isSelected ? "bg-red-50/80 text-rms-burgundy font-semibold" : "text-rms-charcoal hover:bg-gray-50 hover:text-rms-burgundy"
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isSelected ? "bg-rms-burgundy" : "bg-gray-300"
                    }`}
                  />
                  <span className="truncate">{option.label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
