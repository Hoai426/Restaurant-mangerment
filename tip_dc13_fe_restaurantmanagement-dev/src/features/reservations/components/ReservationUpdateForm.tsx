"use client";

import React, { useMemo, useEffect } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
  TableCellsIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { Alert } from "@/components/ui/Alert";
import { IconSpinner } from "@/components/common/IconSpinner";
import { Badge } from "@/components/ui/Badge";
import { TABLE_STATUS_CONFIG } from "@/features/tables/constants/table.constants";
import {
  reservationUpdateSchema,
  getLocalTodayString,
  buildDirtyPatchPayload,
  type ReservationUpdateFormData,
  type NormalizedReservationData,
} from "../utils/validation";
import type { ReservationResponse, ReservationUpdateRequest } from "@/types/reservation";
import type { RestaurantTable } from "@/types/table";

export interface ReservationUpdateFormProps {
  reservations: ReservationResponse[];
  tables: RestaurantTable[];
  isTablesLoading?: boolean;
  isPending: boolean;
  serverError: string | null;
  onSubmit: (payload: ReservationUpdateRequest | null) => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
}

export function ReservationUpdateForm({
  reservations,
  tables,
  isTablesLoading = false,
  isPending,
  serverError,
  onSubmit,
  onCancel,
  showCancelButton = true,
}: ReservationUpdateFormProps) {
  // Normalize GET detail array
  const initialData: NormalizedReservationData = useMemo(() => {
    const first = reservations[0];
    return {
      customerName: first?.customerName || "",
      customerPhone: first?.customerPhone || "",
      reservationDate: first?.reservationDate || getLocalTodayString(),
      startTime: first?.startTime ? first.startTime.slice(0, 5) : "18:00",
      endTime: first?.endTime ? first.endTime.slice(0, 5) : "20:00",
      numberOfGuests: first?.numberOfGuests || 1,
      note: first?.note ?? null,
      tableIds: Array.from(new Set(reservations.map((r) => r.tableId))),
    };
  }, [reservations]);

  const reservationCode = reservations[0]?.reservationCode || "";
  const status = reservations[0]?.status;
  const isLocked =
    status === "CANCELLED" || status === "COMPLETED" || status === "NO_SHOW";

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ReservationUpdateFormData>({
    resolver: zodResolver(reservationUpdateSchema),
    defaultValues: {
      ...initialData,
      note: initialData.note || "",
    },
  });

  // Re-sync form default values if initialData updates
  useEffect(() => {
    reset({
      ...initialData,
      note: initialData.note || "",
    });
  }, [initialData, reset]);

  const watchedTableIds = useWatch({ control, name: "tableIds" });
  const rawNumberOfGuests = useWatch({ control, name: "numberOfGuests" });

  const selectedTableIds = useMemo(
    () => watchedTableIds || [],
    [watchedTableIds]
  );
  const numberOfGuests = Number(rawNumberOfGuests) || 0;

  const totalCapacity = useMemo(() => {
    return tables
      .filter((t) => selectedTableIds.includes(t.id))
      .reduce((sum, t) => sum + (t.capacity || 0), 0);
  }, [tables, selectedTableIds]);

  const isOverCapacity =
    selectedTableIds.length > 0 &&
    numberOfGuests > 0 &&
    numberOfGuests > totalCapacity;

  const handleFormSubmit = (formData: ReservationUpdateFormData) => {
    if (isLocked) return;
    const payload = buildDirtyPatchPayload(formData, initialData);
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col flex-1 font-sans"
    >
      {/* Locked Status Banner */}
      {isLocked && (
        <div className="px-5 sm:px-6 pt-4 pb-0">
          <div className="flex items-center gap-3 p-3.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-700 text-xs sm:text-sm font-medium">
            <LockClosedIcon className="w-5 h-5 text-gray-500 shrink-0" />
            <span>
              Đơn đặt bàn này đã đóng ({status}) và không thể chỉnh sửa thông tin.
            </span>
          </div>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div className="px-5 sm:px-6 pt-4 pb-0">
          <Alert type="error" message={serverError} />
        </div>
      )}

      {/* Main 2-Column Body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* ===================== CỘT TRÁI: CHỌN BÀN ĂN (~45%) ===================== */}
        <div className="w-full lg:w-[45%] p-5 sm:p-6 lg:border-r border-gray-100 flex flex-col bg-gray-50/30">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rms-gold/10 text-rms-gold flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                <TableCellsIcon className="w-4 h-4 text-gray-500" />
                <span>Bàn ăn phân bổ</span>
                <span className="text-red-500">*</span>
              </h4>
            </div>

            {selectedTableIds.length > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-rms-burgundy border border-red-200/60">
                {selectedTableIds.length} bàn đã chọn
              </span>
            )}
          </div>

          {/* Sức chứa tích lũy summary bar */}
          <div className="flex items-center justify-between p-2.5 bg-white border border-gray-200/80 rounded-xl text-xs mb-3 shadow-2xs">
            <span className="text-gray-500 font-medium">Tổng sức chứa tích lũy:</span>
            <span className="font-bold text-gray-900 text-sm">
              {totalCapacity} <span className="font-normal text-xs text-gray-500">khách</span>
            </span>
          </div>

          {/* Non-blocking capacity warning */}
          {isOverCapacity && (
            <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 mb-3 animate-fade-in shrink-0">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Số khách (<strong>{numberOfGuests}</strong>) vượt tổng sức chứa (
                <strong>{totalCapacity}</strong>) của các bàn đã chọn. Vui lòng lưu ý bố trí thêm ghế phụ.
              </span>
            </div>
          )}

          {/* Table List with SEPARATE SCROLL */}
          <div className="flex-1 flex flex-col min-h-0">
            {isTablesLoading ? (
              <div className="py-12 text-center text-xs text-gray-400 flex items-center justify-center gap-2 text-rms-gold">
                <IconSpinner />
                <span>Đang tải danh sách bàn...</span>
              </div>
            ) : tables.length === 0 ? (
              <div className="p-6 bg-white border border-dashed border-gray-200 rounded-xl text-center text-xs text-gray-500 my-auto">
                Không tìm thấy bàn nào trong hệ thống.
              </div>
            ) : (
              <Controller
                name="tableIds"
                control={control}
                render={({ field }) => {
                  const currentIds = field.value || [];
                  const toggleTable = (id: number) => {
                    if (isLocked || isPending) return;
                    if (currentIds.includes(id)) {
                      field.onChange(currentIds.filter((item) => item !== id));
                    } else {
                      field.onChange([...currentIds, id]);
                    }
                  };

                  return (
                    <div className="flex-1 overflow-y-auto max-h-[360px] lg:max-h-[440px] pr-1.5 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {tables.map((table) => {
                          const isSelected = currentIds.includes(table.id);
                          const isOriginalTable = initialData.tableIds.includes(table.id);
                          const statusConfig = TABLE_STATUS_CONFIG[table.status];

                          return (
                            <button
                              key={table.id}
                              type="button"
                              onClick={() => toggleTable(table.id)}
                              disabled={isLocked || isPending}
                              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                                isLocked || isPending
                                  ? "cursor-not-allowed opacity-80"
                                  : "cursor-pointer"
                              } ${
                                isSelected
                                  ? "bg-red-50/90 border-rms-burgundy ring-2 ring-rms-burgundy/20 shadow-xs"
                                  : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 shadow-2xs"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                                      isSelected ? "bg-rms-burgundy" : "bg-gray-300"
                                    }`}
                                  />
                                  <span className="font-bold text-sm text-gray-900 truncate">
                                    Bàn {table.tableNumber}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  {isOriginalTable && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                                      Đang đặt
                                    </span>
                                  )}
                                  {statusConfig && (
                                    <Badge
                                      variant={statusConfig.variant}
                                      className="text-xs px-2 py-0.5 shrink-0"
                                    >
                                      {statusConfig.label}
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="text-xs text-gray-500 flex items-center justify-between pt-1.5 border-t border-gray-100">
                                <span className="truncate max-w-[110px] font-medium text-gray-600">
                                  {table.roomName || `Phòng #${table.roomId}`}
                                </span>
                                <span className="font-semibold text-gray-800 shrink-0">
                                  {table.capacity} chỗ
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }}
              />
            )}

            {errors.tableIds && (
              <p className="text-xs text-red-500 mt-2 font-medium">
                {errors.tableIds.message}
              </p>
            )}
          </div>
        </div>

        {/* ===================== CỘT PHẢI: THÔNG TIN ĐẶT BÀN (~55%) ===================== */}
        <div className="w-full lg:w-[55%] p-5 sm:p-6 flex flex-col space-y-4 overflow-y-auto">
          {/* Section Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-rms-gold/10 text-rms-gold flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                Thông tin đợt đặt bàn
              </h4>
            </div>

            {reservationCode && (
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200">
                Mã: {reservationCode}
              </span>
            )}
          </div>

          {/* Row 1: Số điện thoại & Tên khách hàng (2 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1">
              <label htmlFor="updateCustomerPhone" className="text-xs font-semibold text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative flex items-center border rounded-xl bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 transition-all ${
                  errors.customerPhone ? "border-red-400 bg-red-50/30" : "border-gray-200"
                } ${isLocked ? "opacity-60 bg-gray-100" : ""}`}
              >
                <PhoneIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  id="updateCustomerPhone"
                  type="tel"
                  disabled={isLocked || isPending}
                  placeholder="0912345678"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-transparent outline-hidden text-gray-900 placeholder:text-gray-400 disabled:cursor-not-allowed"
                  {...register("customerPhone")}
                />
              </div>
              {errors.customerPhone && (
                <p className="text-xs text-red-500 font-medium">{errors.customerPhone.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="updateCustomerName" className="text-xs font-semibold text-gray-700">
                Tên khách hàng <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative flex items-center border rounded-xl bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 transition-all ${
                  errors.customerName ? "border-red-400 bg-red-50/30" : "border-gray-200"
                } ${isLocked ? "opacity-60 bg-gray-100" : ""}`}
              >
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  id="updateCustomerName"
                  type="text"
                  disabled={isLocked || isPending}
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-transparent outline-hidden text-gray-900 placeholder:text-gray-400 disabled:cursor-not-allowed"
                  {...register("customerName")}
                />
              </div>
              {errors.customerName && (
                <p className="text-xs text-red-500 font-medium">{errors.customerName.message}</p>
              )}
            </div>
          </div>

          {/* Row 2: Ngày đặt, Giờ bắt đầu, Giờ kết thúc (3 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="space-y-1">
              <label htmlFor="updateReservationDate" className="text-xs font-semibold text-gray-700">
                Ngày đặt <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative flex items-center border rounded-xl bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 transition-all ${
                  errors.reservationDate ? "border-red-400 bg-red-50/30" : "border-gray-200"
                } ${isLocked ? "opacity-60 bg-gray-100" : ""}`}
              >
                <CalendarDaysIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  id="updateReservationDate"
                  type="date"
                  disabled={isLocked || isPending}
                  min={getLocalTodayString()}
                  className="w-full pl-9 pr-2.5 py-2 text-sm bg-transparent outline-hidden text-gray-900 disabled:cursor-not-allowed"
                  {...register("reservationDate")}
                />
              </div>
              {errors.reservationDate && (
                <p className="text-xs text-red-500 font-medium">{errors.reservationDate.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="updateStartTime" className="text-xs font-semibold text-gray-700">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative flex items-center border rounded-xl bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 transition-all ${
                  errors.startTime ? "border-red-400 bg-red-50/30" : "border-gray-200"
                } ${isLocked ? "opacity-60 bg-gray-100" : ""}`}
              >
                <ClockIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  id="updateStartTime"
                  type="time"
                  disabled={isLocked || isPending}
                  className="w-full pl-9 pr-2.5 py-2 text-sm bg-transparent outline-hidden text-gray-900 disabled:cursor-not-allowed"
                  {...register("startTime")}
                />
              </div>
              {errors.startTime && (
                <p className="text-xs text-red-500 font-medium">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label htmlFor="updateEndTime" className="text-xs font-semibold text-gray-700">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative flex items-center border rounded-xl bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 transition-all ${
                  errors.endTime ? "border-red-400 bg-red-50/30" : "border-gray-200"
                } ${isLocked ? "opacity-60 bg-gray-100" : ""}`}
              >
                <ClockIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
                <input
                  id="updateEndTime"
                  type="time"
                  disabled={isLocked || isPending}
                  className="w-full pl-9 pr-2.5 py-2 text-sm bg-transparent outline-hidden text-gray-900 disabled:cursor-not-allowed"
                  {...register("endTime")}
                />
              </div>
              {errors.endTime && (
                <p className="text-xs text-red-500 font-medium">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Row 3: Số lượng khách */}
          <div className="space-y-1">
            <label htmlFor="updateNumberOfGuests" className="text-xs font-semibold text-gray-700">
              Số lượng khách <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative flex items-center border rounded-xl bg-gray-50/50 hover:bg-gray-50 focus-within:bg-white focus-within:border-rms-gold focus-within:ring-2 focus-within:ring-rms-gold/20 transition-all ${
                errors.numberOfGuests ? "border-red-400 bg-red-50/30" : "border-gray-200"
              } ${isLocked ? "opacity-60 bg-gray-100" : ""}`}
            >
              <UserGroupIcon className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                id="updateNumberOfGuests"
                type="number"
                min={1}
                max={200}
                disabled={isLocked || isPending}
                placeholder="2"
                className="w-full pl-9 pr-3 py-2 text-sm bg-transparent outline-hidden text-gray-900 disabled:cursor-not-allowed"
                {...register("numberOfGuests", { valueAsNumber: true })}
              />
            </div>
            {errors.numberOfGuests && (
              <p className="text-xs text-red-500 font-medium">{errors.numberOfGuests.message}</p>
            )}
          </div>

          {/* Row 4: Ghi chú */}
          <div className="space-y-1">
            <label
              htmlFor="updateNote"
              className="text-xs font-semibold text-gray-700 flex items-center gap-1.5"
            >
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-gray-400" />
              <span>Ghi chú đặt bàn</span>
              <span className="text-gray-400 font-normal text-[11px]">(tùy chọn)</span>
            </label>
            <textarea
              id="updateNote"
              rows={3}
              maxLength={500}
              disabled={isLocked || isPending}
              placeholder="Yêu cầu đặc biệt: chuẩn bị hoa, nến, ghế trẻ em..."
              className="w-full p-3 text-sm bg-gray-50/50 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-rms-gold focus:ring-2 focus:ring-rms-gold/20 rounded-xl transition-all outline-hidden text-gray-900 placeholder:text-gray-400 resize-none disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-gray-100"
              {...register("note")}
            />
            {errors.note && (
              <p className="text-xs text-red-500 font-medium">{errors.note.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* ===================== FOOTER FULL-WIDTH ===================== */}
      <div className="border-t border-gray-100 px-5 sm:px-6 py-4 bg-gray-50/60 flex items-center justify-end gap-3 shrink-0">
        {showCancelButton && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="px-5 py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Hủy bỏ
          </button>
        )}

        <button
          type="submit"
          disabled={isLocked || isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <IconSpinner />
              <span>Đang lưu thay đổi...</span>
            </>
          ) : (
            <span>Lưu thay đổi</span>
          )}
        </button>
      </div>
    </form>
  );
}

export default ReservationUpdateForm;
