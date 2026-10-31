"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { IconSpinner } from "@/components/common/IconSpinner";
import { getAccessToken } from "@/utils/cookie";
import { getRoleFromToken } from "@/utils/auth";
import { formatDate, formatDateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import { useReservationDetail } from "../hooks/useReservationDetail";
import {
  RESERVATION_STATUS_CONFIG,
  isReservationEditable,
} from "../constants/reservation.constants";
import type { ReservationDetailModalProps } from "@/types/reservation";
import {
  CalendarDaysIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  TableCellsIcon,
  ChatBubbleBottomCenterTextIcon,
  PencilSquareIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowPathIcon,
  ShieldExclamationIcon,
  ExclamationCircleIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

export function ReservationDetailModal({
  isOpen,
  onClose,
  reservationId,
  onEdit,
  onUpdateStatus,
}: ReservationDetailModalProps) {
  const [copied, setCopied] = useState(false);

  // 1. Phân quyền: Chỉ ADMIN và STAFF mới có quyền xem trên giao diện quản lý
  const token = getAccessToken();
  const userRole = token ? getRoleFromToken(token) : null;
  const isAuthorized = userRole === "ADMIN" || userRole === "STAFF";

  // 2. Query Lifecycle: Kiểm tra ID hợp lệ
  const isValidReservationId =
    typeof reservationId === "number" &&
    Number.isInteger(reservationId) &&
    reservationId > 0;

  const {
    data: reservations,
    isLoading,
    isError,
    error,
    refetch,
  } = useReservationDetail(reservationId ?? 0, {
    enabled: isOpen && isValidReservationId && isAuthorized,
  });

  if (!isOpen) return null;

  // Xử lý sao chép mã đặt bàn vào clipboard
  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-4xl w-full"
      ariaLabelledBy="reservation-detail-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden font-sans border border-gray-100 flex flex-col max-h-[92vh]">
        {/* Header Modal */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rms-gold/10 text-rms-gold flex items-center justify-center shrink-0">
              <CalendarDaysIcon className="w-5 h-5" />
            </div>
            <div>
              <h3
                id="reservation-detail-modal-title"
                className="text-lg font-bold text-rms-charcoal"
              >
                Chi tiết đặt bàn
              </h3>
              <p className="text-xs text-gray-500">
                Thông tin chi tiết về khách hàng, khung giờ và các bàn giữ chỗ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Đóng cửa sổ"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Trạng thái 1: Không có quyền truy cập (Authorization Guard) */}
          {!isAuthorized ? (
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                <ShieldExclamationIcon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                Từ chối truy cập
              </h4>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                Bạn không có quyền xem thông tin chi tiết đặt bàn. Chức năng này chỉ dành cho Quản lý (ADMIN) và Nhân viên (STAFF).
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          ) : !isValidReservationId ? (
            /* Trạng thái 2: ID không hợp lệ */
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <ExclamationCircleIcon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                Mã định danh không hợp lệ
              </h4>
              <p className="text-xs text-gray-500 mb-6">
                Không thể tải thông tin đặt bàn vì mã định danh bàn/đặt chỗ không đúng định dạng.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          ) : isLoading ? (
            /* Trạng thái 3: Đang tải dữ liệu (Loading State) */
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3 text-rms-gold">
              <IconSpinner />
              <span className="text-sm font-medium text-gray-500">
                Đang tải chi tiết đặt bàn...
              </span>
            </div>
          ) : isError ? (
            /* Trạng thái 4: Lỗi từ API (Error State + Retry) */
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                <ExclamationCircleIcon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                {getApiErrorMessage(error).title || "Không thể tải dữ liệu"}
              </h4>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">
                {getApiErrorMessage(error).message}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Đóng lại
                </button>
                <button
                  type="button"
                  onClick={() => refetch()}
                  className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  <span>Thử lại</span>
                </button>
              </div>
            </div>
          ) : !reservations || reservations.length === 0 ? (
            /* Trạng thái 5: Mảng rỗng phòng thủ (Empty State) */
            <div className="py-12 text-center max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center mx-auto mb-3">
                <CalendarDaysIcon className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-gray-900 mb-1">
                Không tìm thấy thông tin đặt bàn
              </h4>
              <p className="text-xs text-gray-500 mb-6">
                Đơn đặt bàn này không tồn tại hoặc đã bị xóa khỏi hệ thống.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Đóng lại
              </button>
            </div>
          ) : (
            /* Trạng thái 6: Thành công - Hiển thị chi tiết Read-only */
            (() => {
              const first = reservations[0];
              const statusConfig = RESERVATION_STATUS_CONFIG[first.status];

              return (
                <div className="space-y-6">
                  {/* Top Bar: Mã đặt chỗ & Badge trạng thái */}
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
                          Mã đặt bàn
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-base font-mono font-bold text-rms-charcoal">
                            {first.reservationCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(first.reservationCode)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
                            title="Sao chép mã đặt bàn"
                          >
                            {copied ? (
                              <>
                                <CheckIcon className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">Đã chép!</span>
                              </>
                            ) : (
                              <>
                                <ClipboardDocumentIcon className="w-3 h-3 text-gray-500" />
                                <span>Sao chép</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider hidden sm:inline-block">
                        Trạng thái:
                      </span>
                      {statusConfig && (
                        <Badge variant={statusConfig.variant} className="text-xs px-3 py-1 font-semibold">
                          {statusConfig.label}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Grid 2 Cột: Khách hàng & Lịch hẹn */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cột 1: Thông tin khách hàng & Người phụ trách */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        <UserIcon className="w-4 h-4 text-rms-gold" />
                        <span>Thông tin khách hàng</span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-start justify-between">
                          <span className="text-gray-500">Tên khách hàng:</span>
                          <span className="font-semibold text-gray-900 text-right">
                            {first.customerName || "—"}
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <span className="text-gray-500">Số điện thoại:</span>
                          <a
                            href={`tel:${first.customerPhone}`}
                            className="font-semibold text-rms-burgundy hover:underline inline-flex items-center gap-1"
                          >
                            <PhoneIcon className="w-3 h-3 text-gray-400" />
                            <span>{first.customerPhone || "—"}</span>
                          </a>
                        </div>

                        <div className="flex items-start justify-between">
                          <span className="text-gray-500">Loại khách hàng:</span>
                          <span className="font-medium text-gray-700">
                            {first.customerId ? (
                              <span className="text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded text-[11px]">
                                Thành viên (#{first.customerId})
                              </span>
                            ) : (
                              <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                                Khách vãng lai
                              </span>
                            )}
                          </span>
                        </div>

                        <div className="flex items-start justify-between pt-2 border-t border-gray-100">
                          <span className="text-gray-500">Người tạo đơn:</span>
                          <span className="text-gray-700 text-right font-medium">
                            {first.createdByName ? (
                              <>
                                <span>{first.createdByName}</span>
                                {first.createdByRole && (
                                  <span className="text-gray-400 font-mono text-[11px] ml-1">
                                    ({first.createdByRole})
                                  </span>
                                )}
                              </>
                            ) : (
                              "—"
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Cột 2: Lịch hẹn & Quy mô */}
                    <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-3">
                      <div className="flex items-center gap-2 pb-2 border-b border-gray-100 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        <ClockIcon className="w-4 h-4 text-rms-gold" />
                        <span>Thời gian & Quy mô</span>
                      </div>

                      <div className="space-y-2.5 text-xs">
                        <div className="flex items-start justify-between">
                          <span className="text-gray-500">Ngày đặt bàn:</span>
                          <span className="font-semibold text-gray-900 inline-flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                            <span>{formatDate(first.reservationDate)}</span>
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <span className="text-gray-500">Khung giờ:</span>
                          <span className="font-semibold text-gray-900 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60">
                            {first.startTime?.slice(0, 5)} — {first.endTime?.slice(0, 5)}
                          </span>
                        </div>

                        <div className="flex items-start justify-between">
                          <span className="text-gray-500">Số lượng khách:</span>
                          <span className="font-bold text-rms-charcoal text-sm inline-flex items-center gap-1">
                            <UserGroupIcon className="w-4 h-4 text-gray-400" />
                            <span>
                              {first.numberOfGuests}{" "}
                              <span className="text-xs font-normal text-gray-500">khách</span>
                            </span>
                          </span>
                        </div>

                        <div className="flex items-start justify-between pt-2 border-t border-gray-100">
                          <span className="text-gray-500">Tổng số bàn giữ chỗ:</span>
                          <span className="font-semibold text-rms-burgundy">
                            {reservations.length} bàn ăn
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Khối 3: Danh sách Bàn ăn & Phòng ăn được phân bổ */}
                  <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                        <TableCellsIcon className="w-4 h-4 text-rms-gold" />
                        <span>Bàn ăn & Phòng ăn được phân bổ</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                        {reservations.length} bàn
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {reservations.map((tableRecord) => (
                        <div
                          key={tableRecord.id}
                          className="p-3 rounded-xl border border-gray-200/80 bg-gray-50/50 flex flex-col justify-between gap-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-gray-900">
                              Bàn {tableRecord.tableNumber}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400">
                              #{tableRecord.tableId}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <BuildingOffice2Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span className="truncate">
                              {tableRecord.roomName || `Phòng #${tableRecord.roomId}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Khối 4: Ghi chú đặc biệt */}
                  <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                      <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-rms-gold" />
                      <span>Ghi chú từ khách hàng</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed bg-gray-50/70 p-3 rounded-lg border border-gray-100 italic">
                      {first.note && first.note.trim() ? (
                        `"${first.note.trim()}"`
                      ) : (
                        <span className="text-gray-400 not-italic">
                          Không có ghi chú đặc biệt cho đơn đặt bàn này.
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Khối 5: Timestamps hệ thống */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Ngày tạo đơn:</span>
                      <span className="font-mono text-gray-600">
                        {formatDateTime(first.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span>Cập nhật lần cuối:</span>
                      <span className="font-mono text-gray-600">
                        {formatDateTime(first.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer"
          >
            Đóng
          </button>

          {/* Nút Cập nhật trạng thái: Chỉ hiển thị khi có onUpdateStatus, có quyền, và đơn ở trạng thái có thể chỉnh sửa */}
          {reservations &&
            reservations.length > 0 &&
            onUpdateStatus &&
            isReservationEditable(reservations[0].status) && (
              <button
                type="button"
                onClick={() => {
                  const targetRes = reservations[0];
                  onClose();
                  onUpdateStatus({
                    id: targetRes.id,
                    status: targetRes.status,
                    reservationCode: targetRes.reservationCode,
                  });
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 rounded-xl shadow-2xs transition-all cursor-pointer"
              >
                <ArrowPathIcon className="w-4 h-4 text-gray-500" />
                <span>Cập nhật trạng thái</span>
              </button>
            )}

          {/* Nút Chỉnh sửa: Chỉ hiển thị khi có onEdit, có quyền, và đơn ở trạng thái có thể chỉnh sửa */}
          {reservations &&
            reservations.length > 0 &&
            onEdit &&
            isReservationEditable(reservations[0].status) && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(reservations[0].id);
                }}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-rms-burgundy hover:bg-rms-burgundy/90 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <PencilSquareIcon className="w-4 h-4" />
                <span>Chỉnh sửa đặt bàn</span>
              </button>
            )}
        </div>
      </div>
    </Modal>
  );
}

export default ReservationDetailModal;
