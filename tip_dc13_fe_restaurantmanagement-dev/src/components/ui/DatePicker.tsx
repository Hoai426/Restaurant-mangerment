"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface DatePickerProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  "aria-label"?: string;
  "aria-describedby"?: string;
  className?: string;
  clearable?: boolean;
  inputRef?: (element: HTMLButtonElement | null) => void;
}

const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DATE_FORMAT = "yyyy-MM-dd";

function parseDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = parse(value, DATE_FORMAT, new Date());
  return isValid(parsed) && format(parsed, DATE_FORMAT) === value ? parsed : null;
}

function toDateString(date: Date): string {
  return format(date, DATE_FORMAT);
}

function dateAccessibleName(date: Date, selected: boolean, today: boolean): string {
  return `${format(date, "EEEE d MMMM yyyy", { locale: vi })}${selected ? ", đã chọn" : ""}${today ? ", hôm nay" : ""}`;
}

function monthDate(day: number, month: Date): Date {
  const target = new Date(month.getFullYear(), month.getMonth(), 1);
  const lastDay = endOfMonth(target).getDate();
  target.setDate(Math.min(day, lastDay));
  return target;
}

export function DatePicker({
  id,
  value,
  onChange,
  onBlur,
  min,
  max,
  disabled = false,
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
  className = "",
  clearable = false,
  inputRef,
}: DatePickerProps) {
  const generatedId = useId();
  const headingId = `${generatedId}-month`;
  const gridId = `${generatedId}-grid`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const blurNotifiedRef = useRef(false);
  const dismissRef = useRef<(restoreFocus: boolean) => void>(() => {});
  const pendingNavigationFocusRef = useRef<"previous" | "next" | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [focusedDate, setFocusedDate] = useState<Date>(() => parseDate(value) ?? new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(parseDate(value) ?? new Date()));
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({ visibility: "hidden" });

  const selectedDate = parseDate(value);
  const minDate = min ? parseDate(min) : null;
  const maxDate = max ? parseDate(max) : null;
  const hasValidRange = !(minDate && maxDate && minDate > maxDate);
  const today = useMemo(() => new Date(), []);
  const dates = useMemo(() => {
    const monthStart = startOfMonth(visibleMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
    const result: Date[] = [];
    for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 1)) result.push(cursor);
    return result;
  }, [visibleMonth]);

  const isDateDisabled = useCallback((date: Date) => {
    const key = toDateString(date);
    return !hasValidRange || Boolean((min && key < min) || (max && key > max));
  }, [hasValidRange, min, max]);

  const getAvailableDate = useCallback((candidate: Date): Date | null => {
    if (!hasValidRange) return null;
    if (minDate && candidate < minDate) candidate = minDate;
    if (maxDate && candidate > maxDate) candidate = maxDate;
    return isDateDisabled(candidate) ? null : candidate;
  }, [hasValidRange, isDateDisabled, maxDate, minDate]);

  const getInitialFocusDate = useCallback((): Date | null => {
    if (!hasValidRange) return null;
    const current = parseDate(value) ?? new Date();
    if (minDate && current < minDate) return minDate;
    if (maxDate && current > maxDate) return maxDate;
    return isDateDisabled(current) ? getAvailableDate(current) : current;
  }, [getAvailableDate, hasValidRange, isDateDisabled, maxDate, minDate, value]);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const popup = popupRef.current;
    if (!trigger || !popup) return;
    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const width = Math.min(304, window.innerWidth - margin * 2);
    popup.style.width = `${width}px`;
    const height = popup.getBoundingClientRect().height;
    const openAbove = window.innerHeight - rect.bottom < height + 6 && rect.top > height + 6;
    const left = Math.max(margin, Math.min(rect.left, window.innerWidth - width - margin));
    const preferredTop = openAbove ? rect.top - height - 6 : rect.bottom + 6;
    const top = Math.max(margin, Math.min(preferredTop, window.innerHeight - height - margin));
    setPopupStyle({ position: "fixed", left, top, width, zIndex: 110, visibility: "visible" });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const dialog = triggerRef.current?.closest<HTMLElement>('[role="dialog"]');
    setPortalTarget(dialog ?? document.body);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !portalTarget || !popupRef.current) return;
    updatePosition();
    const observer = new ResizeObserver(updatePosition);
    observer.observe(popupRef.current);
    const onScrollOrResize = () => updatePosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !popupRef.current?.contains(target)) dismissRef.current(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isOpen, portalTarget, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => {
      updatePosition();
      const navigationDirection = pendingNavigationFocusRef.current;
      if (navigationDirection) {
        popupRef.current?.querySelector<HTMLButtonElement>(`[data-calendar-navigation="${navigationDirection}"]`)?.focus();
        pendingNavigationFocusRef.current = null;
        return;
      }
      const focusable = popupRef.current?.querySelector<HTMLButtonElement>('[data-calendar-date][tabindex="0"]');
      focusable?.focus();
    });
  }, [isOpen, visibleMonth, focusedDate, updatePosition]);

  const notifyBlur = useCallback(() => {
    if (blurNotifiedRef.current) return;
    blurNotifiedRef.current = true;
    onBlur?.();
  }, [onBlur]);

  const close = useCallback((restoreFocus: boolean) => {
    setIsOpen(false);
    notifyBlur();
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus());
  }, [notifyBlur]);

  const dismiss = useCallback((restoreFocus: boolean) => close(restoreFocus), [close]);
  useEffect(() => {
    dismissRef.current = dismiss;
  }, [dismiss]);

  const moveFocus = (next: Date) => {
    const candidate = getAvailableDate(next);
    if (!candidate) return;
    setFocusedDate(candidate);
    setVisibleMonth(startOfMonth(candidate));
  };

  const navigateMonth = (offset: number, year = false) => {
    const nextMonth = year ? addYears(visibleMonth, offset) : addMonths(visibleMonth, offset);
    const targetMonth = startOfMonth(nextMonth);
    const desired = monthDate(focusedDate.getDate(), targetMonth);
    const direction: 1 | -1 = offset >= 0 ? 1 : -1;
    const first = startOfWeek(startOfMonth(targetMonth), { weekStartsOn: 1 });
    const last = endOfWeek(endOfMonth(targetMonth), { weekStartsOn: 1 });
    let candidate: Date | null = null;
    for (let distance = 0; distance <= 42 && !candidate; distance += 1) {
      const preferred = addDays(desired, distance * direction);
      const alternate = addDays(desired, -distance * direction);
      if (preferred >= first && preferred <= last && !isDateDisabled(preferred)) candidate = preferred;
      else if (alternate >= first && alternate <= last && !isDateDisabled(alternate)) candidate = alternate;
    }
    setVisibleMonth(targetMonth);
    if (candidate) {
      pendingNavigationFocusRef.current = null;
      setFocusedDate(candidate);
    } else {
      pendingNavigationFocusRef.current = direction > 0 ? "next" : "previous";
    }
  };

  const handleCalendarKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let next: Date | null = null;
    switch (event.key) {
      case "ArrowLeft": next = addDays(focusedDate, -1); break;
      case "ArrowRight": next = addDays(focusedDate, 1); break;
      case "ArrowUp": next = addDays(focusedDate, -7); break;
      case "ArrowDown": next = addDays(focusedDate, 7); break;
      case "Home": next = startOfWeek(focusedDate, { weekStartsOn: 1 }); break;
      case "End": next = endOfWeek(focusedDate, { weekStartsOn: 1 }); break;
      case "PageUp": navigateMonth(-1, event.shiftKey); event.preventDefault(); return;
      case "PageDown": navigateMonth(1, event.shiftKey); event.preventDefault(); return;
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      case "Tab":
        window.setTimeout(() => dismiss(false), 0);
        return;
      default: return;
    }
    event.preventDefault();
    if (next) moveFocus(next);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  };

  const handleTriggerBlur = (event: FocusEvent<HTMLButtonElement>) => {
    const nextTarget = event.relatedTarget;
    if (nextTarget instanceof Node && popupRef.current?.contains(nextTarget)) return;
    if (!isOpen) notifyBlur();
  };

  const handleOpen = () => {
    if (disabled) return;
    blurNotifiedRef.current = false;
    const initialDate = getInitialFocusDate();
    if (initialDate) {
      setFocusedDate(initialDate);
      setVisibleMonth(startOfMonth(initialDate));
    } else {
      const current = parseDate(value) ?? new Date();
      setFocusedDate(current);
      setVisibleMonth(startOfMonth(current));
    }
    setPortalTarget(null);
    setPopupStyle({ visibility: "hidden" });
    setIsOpen(true);
  };

  const handlePickerControlKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape" && isOpen) {
      event.preventDefault();
      event.stopPropagation();
      close(true);
    }
  };

  return (
    <>
      <div className="relative w-full">
        <CalendarDaysIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <button
          ref={(element) => { triggerRef.current = element; inputRef?.(element); }}
          id={id}
          type="button"
          disabled={disabled}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={isOpen ? gridId : undefined}
          aria-describedby={ariaDescribedBy}
          onBlur={handleTriggerBlur}
          onKeyDown={handleTriggerKeyDown}
          onClick={() => isOpen ? close(false) : handleOpen()}
          className={`w-full pl-9 pr-3 text-left tabular-nums ${className} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span className="text-gray-400">dd/mm/yyyy</span>}
        </button>
        {clearable && value && !disabled && (
          <button
            type="button"
            aria-label="Xóa ngày"
            onKeyDown={handlePickerControlKeyDown}
            onClick={() => { onChange(""); notifyBlur(); }}
            className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-gray-700"
          >
            <XMarkIcon aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {isOpen && portalTarget && createPortal(
        <div
          ref={popupRef}
          style={popupStyle}
          role="dialog"
          aria-label={ariaLabel ? `Chọn ${ariaLabel}` : "Chọn ngày"}
          onKeyDown={handleCalendarKeyDown}
          className="max-h-[min(360px,calc(100vh-16px))] overflow-y-auto rounded-xl border border-gray-200 bg-white p-3 shadow-xl"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 id={headingId} className="text-sm font-bold capitalize text-gray-900">{format(visibleMonth, "LLLL yyyy", { locale: vi })}</h2>
            <div className="flex items-center gap-1">
              <button type="button" data-calendar-navigation="previous" aria-label="Tháng trước" onKeyDown={handlePickerControlKeyDown} onClick={() => navigateMonth(-1)} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/40">
                <ChevronLeftIcon aria-hidden="true" className="h-4 w-4" />
              </button>
              <button type="button" data-calendar-navigation="next" aria-label="Tháng sau" onKeyDown={handlePickerControlKeyDown} onClick={() => navigateMonth(1)} className="rounded-lg p-1.5 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-burgundy/40">
                <ChevronRightIcon aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div role="grid" id={gridId} aria-labelledby={headingId} className="grid grid-cols-7 gap-y-1">
            <div role="row" className="col-span-7 grid grid-cols-7">
              {DAY_NAMES.map((day, index) => <div key={day} role="columnheader" aria-label={index === 6 ? "Chủ nhật" : `Thứ ${index + 2}`} className="py-1 text-center text-[11px] font-semibold text-gray-500">{day}</div>)}
            </div>
            {Array.from({ length: dates.length / 7 }, (_, rowIndex) => (
              <div role="row" key={`row-${rowIndex}`} className="col-span-7 grid grid-cols-7 gap-y-1">
                {dates.slice(rowIndex * 7, rowIndex * 7 + 7).map((date) => {
                  const dateString = toDateString(date);
                  const selected = dateString === value;
                  const isToday = dateString === toDateString(today);
                  const outOfMonth = date.getMonth() !== visibleMonth.getMonth();
                  const unavailable = isDateDisabled(date);
                  const focused = dateString === toDateString(focusedDate) && !unavailable;
                  return (
                    <div role="gridcell" key={dateString} aria-selected={selected} className="flex justify-center">
                      <button
                        type="button"
                        data-calendar-date={dateString}
                        disabled={unavailable}
                        tabIndex={focused ? 0 : -1}
                        aria-label={`${dateAccessibleName(date, selected, isToday)}${unavailable ? ", không khả dụng" : ""}`}
                        aria-current={isToday ? "date" : undefined}
                        onKeyDown={handlePickerControlKeyDown}
                        onFocus={() => setFocusedDate(date)}
                        onClick={() => {
                          if (unavailable) return;
                          onChange(dateString);
                          close(false);
                          triggerRef.current?.focus();
                        }}
                        className={`h-9 w-9 rounded-full text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rms-gold/60 disabled:cursor-not-allowed disabled:opacity-30 ${selected ? "bg-rms-burgundy font-bold text-white" : isToday ? "border border-rms-burgundy font-semibold text-rms-burgundy" : outOfMonth ? "text-gray-300" : "text-gray-800 hover:bg-rms-burgundy/10"}`}
                      >{format(date, "d")}</button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          {!dates.some((date) => !isDateDisabled(date)) && (
            <p role="status" className="mt-2 text-center text-xs text-gray-500">Không có ngày khả dụng trong khoảng đã chọn.</p>
          )}
          {clearable && value && !disabled && <button type="button" onKeyDown={handlePickerControlKeyDown} onClick={() => { onChange(""); close(false); triggerRef.current?.focus(); }} className="mt-2 text-xs font-semibold text-rms-burgundy hover:underline">Xóa ngày</button>}
        </div>,
        portalTarget,
      )}
    </>
  );
}

export default DatePicker;
