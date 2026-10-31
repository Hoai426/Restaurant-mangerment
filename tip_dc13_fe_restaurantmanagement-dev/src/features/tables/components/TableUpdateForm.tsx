"use client";

import React, { useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/FormField";
import { Select, type SelectOption } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import {
  tableUpdateSchema,
  type TableUpdateFormData,
} from "../utils/validation";
import type { TableUpdateFormProps, TableUpdateRequest } from "@/types/table";
import {
  BuildingOffice2Icon,
  CheckIcon,
  HashtagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export function TableUpdateForm({
  table,
  rooms,
  isRoomsLoading = false,
  isSubmitting,
  serverError,
  onSubmit,
  onCancel,
}: TableUpdateFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TableUpdateFormData>({
    resolver: zodResolver(tableUpdateSchema),
    defaultValues: {
      roomId: table.roomId,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
    },
  });

  const roomOptions = useMemo<SelectOption<number>[]>(
    () =>
      rooms.map((room) => ({
        value: room.id,
        label: room.name,
      })),
    [rooms]
  );

  const currentRoomId = useWatch({ control, name: "roomId" });
  const currentTableNumber = useWatch({ control, name: "tableNumber" }) ?? "";
  const currentCapacity = useWatch({ control, name: "capacity" });

  const isRoomIdChanged =
    currentRoomId !== undefined &&
    !Number.isNaN(Number(currentRoomId)) &&
    Number(currentRoomId) !== Number(table.roomId);

  const isTableNumberChanged =
    currentTableNumber.trim() !== "" &&
    currentTableNumber.trim() !== table.tableNumber.trim();

  const isCapacityChanged =
    currentCapacity !== undefined &&
    !Number.isNaN(Number(currentCapacity)) &&
    Number(currentCapacity) !== Number(table.capacity);

  const isFormDirty = isRoomIdChanged || isTableNumberChanged || isCapacityChanged;

  const handleFormSubmit = (data: TableUpdateFormData) => {
    if (!isFormDirty) {
      onCancel();
      return;
    }

    const payload: TableUpdateRequest = {};

    if (isRoomIdChanged && data.roomId !== undefined) {
      payload.roomId = Number(data.roomId);
    }
    if (isTableNumberChanged && data.tableNumber !== undefined) {
      payload.tableNumber = data.tableNumber.trim();
    }
    if (isCapacityChanged && data.capacity !== undefined) {
      payload.capacity = Number(data.capacity);
    }

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 font-sans">
      {serverError && <Alert type="error" message={serverError} />}

      {/* 1. Room Dropdown */}
      <FormField
        label="Phòng ăn"
        id="update-table-room-id"
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
            name="roomId"
            control={control}
            render={({ field }) => (
              <Select<number>
                id="update-table-room-id"
                placeholder="-- Chọn phòng ăn --"
                options={roomOptions}
                value={field.value ?? table.roomId}
                onChange={field.onChange}
                disabled={isSubmitting}
                hasError={!!errors.roomId}
                icon={<BuildingOffice2Icon className="w-5 h-5" strokeWidth={1.8} />}
              />
            )}
          />
        )}
      </FormField>

      {/* 2. Table Number */}
      <FormField
        label="Số bàn"
        id="update-table-number"
        required
        error={errors.tableNumber?.message}
        icon={<HashtagIcon className="w-5 h-5" strokeWidth={1.8} />}
        className="w-full min-w-0"
        inputWrapClassName="w-full min-w-0"
      >
        <input
          id="update-table-number"
          type="text"
          placeholder="Ví dụ: B01, B02, VIP-01"
          disabled={isSubmitting}
          maxLength={20}
          autoFocus
          className="rms-field__input w-full min-w-0"
          {...register("tableNumber")}
        />
      </FormField>

      {/* 3. Capacity */}
      <FormField
        label="Sức chứa (người)"
        id="update-table-capacity"
        required
        error={errors.capacity?.message}
        icon={<UserGroupIcon className="w-5 h-5" strokeWidth={1.8} />}
        className="w-full min-w-0"
        inputWrapClassName="w-full min-w-0"
      >
        <input
          id="update-table-capacity"
          type="number"
          min={1}
          step={1}
          placeholder="Ví dụ: 4"
          disabled={isSubmitting}
          className="rms-field__input w-full min-w-0"
          {...register("capacity", { valueAsNumber: true })}
        />
      </FormField>

      {/* Form Action Buttons */}
      <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !isFormDirty}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 hover:-translate-y-0.5 bg-rms-gradient shadow-xs disabled:opacity-50 disabled:hover:translate-y-0 cursor-pointer disabled:cursor-not-allowed min-w-[130px]"
        >
          {isSubmitting ? (
            <>
              <IconSpinner />
              <span>Đang lưu...</span>
            </>
          ) : (
            <>
              <CheckIcon className="w-4 h-4" />
              <span>Lưu thay đổi</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default TableUpdateForm;
