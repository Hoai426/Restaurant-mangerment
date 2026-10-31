"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlusIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useTables } from "@/features/tables";
import { useCreateReservation } from "@/features/reservations/hooks/useCreateReservation";
import { useMyProfile } from "@/features/users/hooks/useMyProfile";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { Badge } from "@/components/ui/Badge";
import type { ReservationResponse } from "@/types/reservation";
import type { ReservationCreateFormData } from "@/features/reservations/utils/validation";
import ReservationCreateForm from "@/features/reservations/components/ReservationCreateForm";

export default function CustomerReservationPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdReservations, setCreatedReservations] = useState<ReservationResponse[] | null>(null);

  // Fetch logged in customer's profile to pre-fill their info
  const { data: user } = useMyProfile();

  // Fetch tables
  const { data: tables = [], isLoading: isTablesLoading } = useTables();

  const { mutate: createReservation, isPending } = useCreateReservation({
    onSuccess: (reservations: ReservationResponse[]) => {
      setServerError(null);
      setCreatedReservations(reservations);
    },
    onError: (err) => {
      const errorInfo = getApiErrorMessage(err);
      setServerError(errorInfo.message);
    },
  });

  const handleSubmit = (data: ReservationCreateFormData) => {
    setServerError(null);
    createReservation({
      tableIds: data.tableIds,
      customerPhone: data.customerPhone.trim(),
      customerName: data.customerName.trim(),
      reservationDate: data.reservationDate,
      startTime: data.startTime,
      endTime: data.endTime,
      numberOfGuests: data.numberOfGuests,
      note: data.note?.trim() || undefined,
    });
  };

  const handleBookAnother = () => {
    setCreatedReservations(null);
    setServerError(null);
  };

  // SUCCESS CONFIRMATION VIEW
  if (createdReservations && createdReservations.length > 0) {
    const first = createdReservations[0];
    const tableNumbers = createdReservations.map((r) => r.tableNumber).join(", ");
    const roomNames = Array.from(new Set(createdReservations.map((r) => r.roomName))).join(", ");

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 font-sans">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-rms-burgundy via-rms-burgundy/95 to-rms-burgundy/80 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-emerald-300 ring-8 ring-white/5 mb-4 shadow-inner">
              <CheckCircleIcon className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Yêu cầu đặt bàn đã được gửi thành công!
            </h1>
            <p className="mt-2 text-white/80 text-sm max-w-lg mx-auto">
              Nhà hàng đã nhận được thông tin đặt bàn của bạn và sẽ tiến hành xác nhận trong thời gian sớm nhất.
            </p>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Reservation Code & Status */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <div>
                <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold block">
                  Mã đặt bàn
                </span>
                <span className="font-mono text-xl font-bold text-rms-burgundy">
                  {first.reservationCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Trạng thái:</span>
                <Badge variant="warning">
                  Chờ xác nhận (PENDING)
                </Badge>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Bàn & Phòng ăn
                </span>
                <p className="font-semibold text-gray-900">
                  {tableNumbers} {roomNames ? `(${roomNames})` : ""}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Số lượng: {createdReservations.length} bàn
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Thời gian đặt bàn
                </span>
                <p className="font-semibold text-gray-900">
                  {first.startTime} - {first.endTime}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ngày {first.reservationDate}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Thông tin liên hệ
                </span>
                <p className="font-semibold text-gray-900">{first.customerName}</p>
                <p className="text-xs text-gray-500 mt-1">{first.customerPhone}</p>
              </div>

              <div className="p-4 rounded-xl border border-gray-100 bg-white">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                  Số lượng khách
                </span>
                <p className="font-semibold text-gray-900">{first.numberOfGuests} khách</p>
                {first.note && (
                  <p className="text-xs text-gray-500 mt-1 truncate" title={first.note}>
                    Ghi chú: {first.note}
                  </p>
                )}
              </div>
            </div>

            {/* Note banner */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200/60 text-amber-800 text-xs leading-relaxed">
              <SparklesIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Nhân viên chăm sóc khách hàng của chúng tôi sẽ liên hệ qua số điện thoại{" "}
                <strong className="font-semibold">{first.customerPhone}</strong> để xác nhận và sẵn sàng phục vụ quý khách chu đáo nhất.
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleBookAnother}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Đặt thêm bàn khác</span>
              </button>

              <button
                type="button"
                onClick={() => router.push("/menu")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-rms-burgundy text-white text-sm font-bold hover:bg-rms-burgundy/90 active:scale-95 transition-all cursor-pointer shadow-md"
              >
                <span>Khám phá thực đơn</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // BOOKING FORM VIEW
  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rms-gold/15 text-rms-gold flex items-center justify-center shadow-xs">
              <CalendarDaysIcon className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Đặt bàn trực tuyến
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Lựa chọn bàn ăn và khung thời gian yêu thích của bạn để có trải nghiệm ẩm thực trọn vẹn nhất.
          </p>
        </div>
      </div>

      {/* Main Booking Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ReservationCreateForm
          tables={tables}
          isTablesLoading={isTablesLoading}
          defaultCustomerName={user?.fullName || ""}
          defaultCustomerPhone={user?.phone || ""}
          isPending={isPending}
          serverError={serverError}
          onSubmit={handleSubmit}
          showCancelButton={false}
        />
      </div>
    </div>
  );
}
