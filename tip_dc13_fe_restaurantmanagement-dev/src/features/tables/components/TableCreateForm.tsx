"use client";

import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import {
  tableCreateSchema,
  type TableCreateFormData,
} from "../utils/validation";
import {
  BuildingOffice2Icon,
  PlusIcon,
  HashtagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

import type { Room } from "@/types/room";

export interface TableCreateFormProps {
  roomId?: number;
  roomName?: string;
  rooms?: Room[];
  isRoomsLoading?: boolean;
  isPending: boolean;
  serverError: string | null;
  onSubmit: (data: TableCreateFormData) => void;
  onCancel: () => void;
}

export function TableCreateForm({
  roomId,
  roomName,
  rooms = [],
  isRoomsLoading = false,
  isPending,
  serverError,
  onSubmit,
  onCancel,
}: TableCreateFormProps) {
  const roomOptions = useMemo<SelectOption<number>[]>(
    () => rooms.map((r) => ({ value: r.id, label: r.name })),
    [rooms]
  );

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<TableCreateFormData>({
    resolver: zodResolver(tableCreateSchema),
    defaultValues: {
      roomId: roomId ?? (rooms.length > 0 ? rooms[0].id : undefined),
      tableNumber: "",
      capacity: 4,
    },
  });

  // Ensure roomId updates if prop changes or auto-select first available room on load
  useEffect(() => {
    if (roomId) {
      setValue("roomId", roomId, { shouldValidate: true });
    } else if (rooms.length > 0) {
      const currentRoomId = getValues("roomId");
      if (!currentRoomId || !rooms.some((r) => r.id === currentRoomId)) {
        setValue("roomId", rooms[0].id, { shouldValidate: true });
      }
    }
  }, [roomId, rooms, setValue, getValues]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 font-sans">
      {serverError && <Alert type="error" message={serverError} />}

      {/* Room Context: Fixed badge if provided, or Select dropdown if creating generally */}
      {roomId && roomName ? (
        <div className="flex items-center gap-3 p-3.5 bg-gray-50/80 border border-gray-100 rounded-xl">
          <div className="w-9 h-9 rounded-lg bg-rms-gold/10 text-rms-gold flex items-center justify-center shrink-0">
            <BuildingOffice2Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <span className="text-gray-500">Phòng: </span>
            <span className="font-semibold text-rms-charcoal text-sm truncate">
              {roomName}
            </span>
            <span className="text-gray-400 font-mono ml-1.5">(#{roomId})</span>
          </div>
          <input
            type="hidden"
            value={roomId}
            {...register("roomId", { valueAsNumber: true })}
          />
        </div>
      ) : rooms.length === 0 && !isRoomsLoading ? (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
          <p className="font-semibold">Chưa có phòng ăn nào trong hệ thống.</p>
          <p className="mt-1 text-amber-700">Vui lòng tạo phòng ăn trước khi thêm bàn mới.</p>
        </div>
      ) : (
        <FormField
          label="Phòng ăn"
          id="create-table-room-id"
          required
          error={errors.roomId?.message}
        >
          {isRoomsLoading ? (
            <div className="rms-field__input w-full px-3.5 py-2.5 flex items-center gap-2 text-gray-400 text-sm">
              <IconSpinner />
              <span>Đang tải danh sách phòng...</span>
            </div>
          ) : (
            <Controller
              control={control}
              name="roomId"
              render={({ field }) => (
                <Select<number>
                  id="create-table-room-id"
                  placeholder="-- Chọn phòng ăn --"
                  options={roomOptions}
                  value={field.value}
                  onChange={(val) => {
                    const numVal = Number(val);
                    field.onChange(numVal);
                    setValue("roomId", numVal, { shouldValidate: true });
                  }}
                  hasError={!!errors.roomId}
                  disabled={isPending}
                  icon={<BuildingOffice2Icon className="w-5 h-5" strokeWidth={1.8} />}
                />
              )}
            />
          )}
        </FormField>
      )}

      {/* 1. Table Number */}
      <FormField
        label="Số bàn"
        id="table-number"
        required
        error={errors.tableNumber?.message}
        icon={<HashtagIcon className="w-5 h-5" strokeWidth={1.8} />}
        className="w-full min-w-0"
        inputWrapClassName="w-full min-w-0"
      >
        <input
          id="table-number"
          type="text"
          placeholder="Ví dụ: B01, B02, VIP-01"
          disabled={isPending}
          maxLength={20}
          autoFocus
          className="rms-field__input w-full min-w-0"
          {...register("tableNumber")}
        />
      </FormField>

      {/* 2. Capacity */}
      <FormField
        label="Sức chứa (người)"
        id="table-capacity"
        required
        error={errors.capacity?.message}
        icon={<UserGroupIcon className="w-5 h-5" strokeWidth={1.8} />}
        className="w-full min-w-0"
        inputWrapClassName="w-full min-w-0"
      >
        <input
          id="table-capacity"
          type="number"
          min={1}
          step={1}
          placeholder="Ví dụ: 4"
          disabled={isPending}
          className="rms-field__input w-full min-w-0"
          {...register("capacity", { valueAsNumber: true })}
        />
      </FormField>

      {/* Form Action Buttons */}
      <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isPending || (!roomId && rooms.length === 0 && !isRoomsLoading)}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-xs disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed min-w-[130px]"
        >
          {isPending ? (
            <>
              <IconSpinner />
              <span>Đang thêm bàn...</span>
            </>
          ) : (
            <>
              <PlusIcon className="w-4 h-4" />
              <span>Thêm bàn</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default TableCreateForm;
