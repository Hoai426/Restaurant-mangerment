"use client";

import React from "react";
import {
  EyeIcon,
  PencilSquareIcon,
  UserGroupIcon,
  PhoneIcon,
  CalendarDaysIcon,
  ClockIcon,
  TableCellsIcon,
  InboxIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatDateTime } from "@/utils/format";
import {
  RESERVATION_STATUS_CONFIG,
  isReservationEditable,
} from "../constants/reservation.constants";
import type { ReservationResponse } from "@/types/reservation";

export interface ReservationTableProps {
  reservations: ReservationResponse[];
  isLoading: boolean;
  onViewDetail: (id: number) => void;
  onEdit: (id: number) => void;
  onUpdateStatus?: (reservation: ReservationResponse) => void;
}

export function ReservationTable({
  reservations,
  isLoading,
  onViewDetail,
  onEdit,
  onUpdateStatus,
}: ReservationTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-4">
        {/* Skeleton Header */}
        <div className="h-6 bg-gray-100 rounded-md w-1/4 animate-pulse" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 bg-gray-50 rounded-xl animate-pulse flex items-center justify-between px-4"
            >
              <div className="h-4 bg-gray-200 rounded-md w-24" />
              <div className="h-4 bg-gray-200 rounded-md w-32" />
              <div className="h-4 bg-gray-200 rounded-md w-20" />
              <div className="h-4 bg-gray-200 rounded-md w-28" />
              <div className="h-4 bg-gray-200 rounded-md w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
          <InboxIcon className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">
          Không tìm thấy đơn đặt bàn nào
        </h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Không có kết quả phù hợp với tiêu chí lọc hiện tại. Hãy thử thay đổi bộ lọc hoặc xóa lọc để xem toàn bộ danh sách.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ================= DESKTOP DATA TABLE ================= */}
      <div className="hidden lg:block overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-xs">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-100 select-none">
            <tr>
              <th scope="col" className="py-3.5 px-4">
                Mã đặt bàn
              </th>
              <th scope="col" className="py-3.5 px-4">
                Khách hàng
              </th>
              <th scope="col" className="py-3.5 px-4">
                Bàn ăn & Phòng
              </th>
              <th scope="col" className="py-3.5 px-4">
                Lịch hẹn
              </th>
              <th scope="col" className="py-3.5 px-4 text-center">
                Số khách
              </th>
              <th scope="col" className="py-3.5 px-4 text-center">
                Trạng thái
              </th>
              <th scope="col" className="py-3.5 px-4">
                Ghi chú
              </th>
              <th scope="col" className="py-3.5 px-4 text-right">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reservations.map((reservation) => {
              const statusConfig = RESERVATION_STATUS_CONFIG[reservation.status];
              const canEdit = isReservationEditable(reservation.status);

              return (
                <tr
                  key={reservation.id}
                  className="hover:bg-gray-50/60 transition-colors"
                >
                  {/* Mã đặt bàn */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md text-xs">
                      {reservation.reservationCode}
                    </span>
                    <div className="text-[11px] text-gray-400 mt-1">
                      Tạo: {formatDateTime(reservation.createdAt)}
                    </div>
                  </td>

                  {/* Khách hàng */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-gray-900">
                      {reservation.customerName}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <PhoneIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>{reservation.customerPhone}</span>
                    </div>
                  </td>

                  {/* Bàn ăn & Phòng */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50/60 text-rms-burgundy font-semibold text-xs border border-red-100/60">
                      <TableCellsIcon className="w-3.5 h-3.5" />
                      <span>Bàn {reservation.tableNumber}</span>
                    </div>
                    {reservation.roomName && (
                      <div className="text-xs text-gray-500 mt-1">
                        {reservation.roomName}
                      </div>
                    )}
                  </td>

                  {/* Lịch hẹn */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-800">
                      <CalendarDaysIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>{formatDate(reservation.reservationDate)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {reservation.startTime} - {reservation.endTime}
                      </span>
                    </div>
                  </td>

                  {/* Số lượng khách */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                      <UserGroupIcon className="w-3.5 h-3.5 text-gray-500" />
                      {reservation.numberOfGuests} khách
                    </span>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <Badge
                      variant={statusConfig?.variant || "neutral"}
                      className={statusConfig?.badgeClass}
                    >
                      {statusConfig?.label || reservation.status}
                    </Badge>
                  </td>

                  {/* Ghi chú */}
                  <td className="py-3.5 px-4 max-w-xs">
                    {reservation.note ? (
                      <span
                        className="text-xs text-gray-600 line-clamp-2"
                        title={reservation.note}
                      >
                        {reservation.note}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Thao tác */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      {/* Nút Chi tiết */}
                      <button
                        type="button"
                        onClick={() => onViewDetail(reservation.id)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Xem chi tiết đặt bàn"
                        aria-label={`Xem chi tiết đơn ${reservation.reservationCode}`}
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      {/* Nút Đổi trạng thái: Chỉ PENDING hoặc CONFIRMED */}
                      {onUpdateStatus && canEdit && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(reservation)}
                          className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="Cập nhật trạng thái"
                          aria-label={`Cập nhật trạng thái đơn ${reservation.reservationCode}`}
                        >
                          <ArrowPathIcon className="w-4 h-4" />
                        </button>
                      )}

                      {/* Nút Sửa: Chỉ PENDING hoặc CONFIRMED */}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(reservation.id)}
                          className="p-1.5 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          title="Chỉnh sửa đặt bàn"
                          aria-label={`Chỉnh sửa đơn ${reservation.reservationCode}`}
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE / TABLET CARD VIEW ================= */}
      <div className="block lg:hidden space-y-3">
        {reservations.map((reservation) => {
          const statusConfig = RESERVATION_STATUS_CONFIG[reservation.status];
          const canEdit = isReservationEditable(reservation.status);

          return (
            <div
              key={reservation.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-xs p-4 space-y-3"
            >
              {/* Header: Code & Status */}
              <div className="flex items-center justify-between gap-2 border-b border-gray-50 pb-2.5">
                <div>
                  <span className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md text-xs">
                    {reservation.reservationCode}
                  </span>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    Tạo: {formatDateTime(reservation.createdAt)}
                  </div>
                </div>
                <Badge
                  variant={statusConfig?.variant || "neutral"}
                  className={statusConfig?.badgeClass}
                >
                  {statusConfig?.label || reservation.status}
                </Badge>
              </div>

              {/* Customer & Table */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <div className="text-gray-400 text-[11px]">Khách hàng</div>
                  <div className="font-medium text-gray-900 mt-0.5 truncate">
                    {reservation.customerName}
                  </div>
                  <div className="text-gray-500 mt-0.5 truncate">
                    {reservation.customerPhone}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-[11px]">Bàn ăn & Phòng</div>
                  <div className="font-semibold text-rms-burgundy mt-0.5">
                    Bàn {reservation.tableNumber}
                  </div>
                  <div className="text-gray-500 mt-0.5 truncate">
                    {reservation.roomName || "—"}
                  </div>
                </div>
              </div>

              {/* Time & Guests */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/70 rounded-xl p-2.5">
                <div>
                  <div className="text-gray-400 text-[11px]">Thời gian</div>
                  <div className="font-medium text-gray-800 mt-0.5">
                    {formatDate(reservation.reservationDate)}
                  </div>
                  <div className="text-gray-500 mt-0.5">
                    {reservation.startTime} - {reservation.endTime}
                  </div>
                </div>

                <div>
                  <div className="text-gray-400 text-[11px]">Số lượng khách</div>
                  <div className="font-medium text-gray-800 mt-0.5">
                    {reservation.numberOfGuests} khách
                  </div>
                  {reservation.note && (
                    <div
                      className="text-gray-500 mt-0.5 truncate text-[11px]"
                      title={reservation.note}
                    >
                      {reservation.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => onViewDetail(reservation.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
                >
                  <EyeIcon className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>

                {onUpdateStatus && canEdit && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(reservation)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <ArrowPathIcon className="w-3.5 h-3.5" />
                    <span>Trạng thái</span>
                  </button>
                )}

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(reservation.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReservationTable;
