"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTables } from "@/features/tables/hooks/useTables";
import { TABLE_STATUS_CONFIG } from "@/features/tables/constants/table.constants";
import {
  isTableOrderable,
  TABLE_ORDERABLE_HELPERS,
} from "../constants/order.constants";
import { Badge } from "@/components/ui/Badge";
import { IconSpinner } from "@/components/common/IconSpinner";
import {
  TableCellsIcon,
  ChevronDownIcon,
  CheckIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  ExclamationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface OrderTableSelectProps {
  selectedTableId: number | null;
  onSelectTable: (tableId: number | null) => void;
  disabled?: boolean;
}

export function OrderTableSelect({
  selectedTableId,
  onSelectTable,
  disabled = false,
}: OrderTableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: tables = [], isLoading, isError } = useTables();

  const selectedTable = useMemo(
    () => tables.find((t) => t.id === selectedTableId),
    [tables, selectedTableId]
  );

  // Nhóm các bàn theo Phòng ăn
  const groupedTables = useMemo(() => {
    const groups: Record<string, typeof tables> = {};
    for (const table of tables) {
      const roomKey = table.roomName || `Phòng #${table.roomId}`;
      if (!groups[roomKey]) {
        groups[roomKey] = [];
      }
      groups[roomKey].push(table);
    }
    return groups;
  }, [tables]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-400">
        <IconSpinner />
        <span>Đang tải bàn...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl border border-red-200 text-xs">
        <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
        <span>Lỗi tải danh sách bàn</span>
      </div>
    );
  }

  const selectedStatusConfig = selectedTable
    ? TABLE_STATUS_CONFIG[selectedTable.status]
    : null;

  return (
    <div ref={dropdownRef} className="relative">
      {/* 1. Nút Trigger tùy biến đồng bộ với Design System */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex items-center justify-between gap-2.5 px-3 py-1.5 sm:py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all shadow-2xs select-none cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed ${
          selectedTable
            ? "bg-white border-emerald-300 text-gray-900 hover:border-emerald-400"
            : "bg-white border-amber-300 text-gray-600 hover:border-amber-400"
        } ${isOpen ? "ring-2 ring-rms-burgundy/20 border-rms-burgundy" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-amber-50 text-rms-gold flex items-center justify-center shrink-0">
            <TableCellsIcon className="w-3.5 h-3.5" />
          </div>

          {selectedTable ? (
            <div className="flex items-center gap-2 min-w-0 text-left">
              <span className="font-bold text-gray-900 truncate">
                Bàn {selectedTable.tableNumber}
              </span>
              <span className="hidden md:inline text-[11px] text-gray-400">|</span>
              <span className="hidden md:inline text-xs font-normal text-gray-500 truncate">
                {selectedTable.roomName || `Phòng #${selectedTable.roomId}`}
              </span>
              {selectedStatusConfig && (
                <Badge
                  variant={selectedStatusConfig.variant}
                  className="text-xs px-2 py-0.5 shrink-0 font-medium"
                >
                  {selectedStatusConfig.label}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-gray-500 font-medium truncate">
              Chọn bàn phục vụ <span className="text-red-500">*</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-400 shrink-0">
          {selectedTable && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSelectTable(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  onSelectTable(null);
                }
              }}
              className="p-0.5 hover:text-red-600 hover:bg-gray-100 rounded transition-colors cursor-pointer"
              title="Bỏ chọn bàn"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-rms-burgundy" : ""
            }`}
          />
        </div>
      </button>

      {/* 2. Menu Popover Danh sách bàn (Custom Floating Menu) */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Danh sách bàn ăn"
          className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in-up divide-y divide-gray-100 max-h-[380px] flex flex-col font-sans"
        >
          {/* Header của Popover */}
          <div className="px-3.5 py-2.5 bg-gray-50/80 flex items-center justify-between text-xs font-bold text-gray-700 shrink-0">
            <span className="flex items-center gap-1.5">
              <TableCellsIcon className="w-4 h-4 text-rms-burgundy" />
              Chọn bàn ăn dùng bữa
            </span>
            <span className="text-[11px] font-normal text-gray-500">
              {tables.length} bàn trong hệ thống
            </span>
          </div>

          {/* Danh sách các phòng và bàn */}
          <div className="overflow-y-auto flex-1 p-1.5 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
            {Object.entries(groupedTables).map(([roomName, roomTables]) => (
              <div key={roomName} className="space-y-1">
                {/* Tiêu đề phòng */}
                <div className="px-2.5 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <BuildingOffice2Icon className="w-3.5 h-3.5 text-gray-400" />
                  <span>{roomName}</span>
                </div>

                {/* Các bàn trong phòng */}
                <div className="grid grid-cols-1 gap-1">
                  {roomTables.map((tbl) => {
                    const canOrder = isTableOrderable(tbl.status);
                    const isSelected = tbl.id === selectedTableId;
                    const statusConfig = TABLE_STATUS_CONFIG[tbl.status];
                    const disableReason =
                      TABLE_ORDERABLE_HELPERS[tbl.status]?.reason;

                    return (
                      <button
                        key={tbl.id}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        disabled={!canOrder}
                        onClick={() => {
                          if (canOrder) {
                            onSelectTable(tbl.id);
                            setIsOpen(false);
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-rms-burgundy/10 border border-rms-burgundy/30 text-rms-burgundy font-bold shadow-2xs"
                            : canOrder
                            ? "hover:bg-gray-50 border border-transparent text-gray-800 cursor-pointer"
                            : "opacity-45 bg-gray-50/60 border border-transparent text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-rms-burgundy text-white"
                                : canOrder
                                ? "bg-gray-100 text-gray-700"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            #{tbl.tableNumber}
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                              <span>Bàn {tbl.tableNumber}</span>
                              {isSelected && (
                                <CheckIcon className="w-3.5 h-3.5 text-rms-burgundy stroke-[3]" />
                              )}
                            </div>
                            <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <UserGroupIcon className="w-3 h-3 text-gray-400" />
                              <span>{tbl.capacity} chỗ</span>
                              {!canOrder && disableReason && (
                                <span className="text-red-500 font-medium">
                                  • {disableReason}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0 pl-2">
                          <Badge
                            variant={statusConfig?.variant || "neutral"}
                            className="text-xs px-2 py-0.5"
                          >
                            {statusConfig?.label || tbl.status}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderTableSelect;
