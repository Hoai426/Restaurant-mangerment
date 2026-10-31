"use client";

import React, { useState, useMemo } from "react";
import {
  PlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useTables } from "@/features/tables/hooks/useTables";
import {
  useReservations,
  ReservationFilterBar,
  ReservationTable,
  ReservationPagination,
  ReservationCreateModal,
  ReservationDetailModal,
  ReservationUpdateModal,
  ReservationStatusModal,
} from "@/features/reservations";
import {
  RESERVATION_SORT_OPTIONS,
  type ReservationSortOptionValue,
} from "@/features/reservations/constants/reservation.constants";
import type { ReservationStatus } from "@/types/reservation";
import type { SearchRequest, FilterCriteria } from "@/types/search";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";

export default function ReservationsPage() {
  // 1. Auth Guard for ADMIN and STAFF
  const { isAuthorized } = useRequireAuth(["ADMIN", "STAFF"]);

  // 2. Filter & Pagination States (Local state)
  const [reservationDate, setReservationDate] = useState<string>("");
  const [status, setStatus] = useState<ReservationStatus | "ALL">("ALL");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [sortOption, setSortOption] =
    useState<ReservationSortOptionValue>("created_desc");
  const [page, setPage] = useState<number>(0); // 0-indexed
  const [size, setSize] = useState<number>(10);

  // 3. Modal States
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [viewingReservationId, setViewingReservationId] = useState<number | null>(
    null
  );
  const [editingReservationId, setEditingReservationId] = useState<number | null>(
    null
  );
  const [statusTargetReservation, setStatusTargetReservation] = useState<{
    id: number;
    status: ReservationStatus;
    reservationCode: string;
  } | null>(null);

  // 4. Load Tables for Filter Dropdown (Technical limit: size = 1000)
  const { data: tables = [], isLoading: isTablesLoading } = useTables();

  // 5. Construct Search Request (AND logic, omit empty filters)
  const searchRequest = useMemo<SearchRequest>(() => {
    const filters: FilterCriteria[] = [];

    if (reservationDate.trim() !== "") {
      filters.push({
        field: "reservationDate",
        value: reservationDate.trim(),
        operation: "EQ",
      });
    }

    if (status !== "ALL") {
      filters.push({
        field: "status",
        value: status,
        operation: "EQ",
      });
    }

    if (selectedTableId !== null) {
      filters.push({
        field: "table.id",
        value: selectedTableId,
        operation: "EQ",
      });
    }

    const sortConfig = RESERVATION_SORT_OPTIONS.find(
      (opt) => opt.value === sortOption
    );
    const sorts = sortConfig
      ? sortConfig.sorts
      : [{ field: "createdAt", direction: "DESC" as const }];

    return { filters, sorts };
  }, [reservationDate, status, selectedTableId, sortOption]);

  // 6. Query Reservations with keepPreviousData
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useReservations(searchRequest, {
    page,
    size,
    enabled: isAuthorized === true,
  });

  // Filter change handlers (auto reset page to 0)
  const handleReservationDateChange = (newDate: string) => {
    setReservationDate(newDate);
    setPage(0);
  };

  const handleStatusChange = (newStatus: ReservationStatus | "ALL") => {
    setStatus(newStatus);
    setPage(0);
  };

  const handleTableChange = (tableId: number | null) => {
    setSelectedTableId(tableId);
    setPage(0);
  };

  const handleSortChange = (newSort: ReservationSortOptionValue) => {
    setSortOption(newSort);
    setPage(0);
  };

  const handleResetFilter = () => {
    setReservationDate("");
    setStatus("ALL");
    setSelectedTableId(null);
    setSortOption("created_desc");
    setPage(0);
  };

  const isFiltered =
    reservationDate !== "" ||
    status !== "ALL" ||
    selectedTableId !== null ||
    sortOption !== "created_desc";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Quản lý đặt bàn
            </h1>
            {isFetching && !isLoading && (
              <ArrowPathIcon className="w-4 h-4 text-gray-400 animate-spin" />
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Tra cứu, lọc và theo dõi danh sách đặt bàn theo thời gian thực
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-rms-burgundy hover:bg-rms-burgundy/90 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Tạo đặt bàn mới</span>
        </button>
      </div>

      {/* Filter Bar */}
      <ReservationFilterBar
        reservationDate={reservationDate}
        status={status}
        selectedTableId={selectedTableId}
        sortOption={sortOption}
        tables={tables}
        isTablesLoading={isTablesLoading}
        isFiltered={isFiltered}
        onReservationDateChange={handleReservationDateChange}
        onStatusChange={handleStatusChange}
        onTableChange={handleTableChange}
        onSortChange={handleSortChange}
        onResetFilter={handleResetFilter}
      />

      {/* Server Error State */}
      {isError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-sm text-red-800">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-600 shrink-0" />
            <span>
              {error
                ? getApiErrorMessage(error).message
                : "Không thể tải danh sách đặt bàn."}
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-white border border-red-200 text-red-700 hover:bg-red-50 rounded-lg font-medium text-xs transition-colors shrink-0 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Main Reservation Data Table */}
      <ReservationTable
        reservations={data?.content || []}
        isLoading={isLoading}
        onViewDetail={(id) => setViewingReservationId(id)}
        onEdit={(id) => setEditingReservationId(id)}
        onUpdateStatus={(res) =>
          setStatusTargetReservation({
            id: res.id,
            status: res.status,
            reservationCode: res.reservationCode,
          })
        }
      />

      {/* Pagination Controls */}
      {data && (
        <ReservationPagination
          currentPage={page}
          totalPages={data.totalPages || 0}
          totalElements={data.totalElements || 0}
          pageSize={size}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => {
            setSize(newSize);
            setPage(0);
          }}
          disabled={isLoading || isFetching}
        />
      )}

      {/* ================= MODALS ================= */}

      {/* Modal: Tạo đặt bàn mới (RM-97) */}
      <ReservationCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {/* Modal: Xem chi tiết đặt bàn (RM-99) */}
      <ReservationDetailModal
        isOpen={viewingReservationId !== null}
        reservationId={viewingReservationId}
        onClose={() => setViewingReservationId(null)}
        onEdit={(id) => {
          setViewingReservationId(null);
          setEditingReservationId(id);
        }}
        onUpdateStatus={(target) => {
          setViewingReservationId(null);
          setStatusTargetReservation(target);
        }}
      />

      {/* Modal: Cập nhật đặt bàn (RM-98) */}
      <ReservationUpdateModal
        isOpen={editingReservationId !== null}
        reservationId={editingReservationId}
        onClose={() => setEditingReservationId(null)}
      />

      {/* Modal: Cập nhật trạng thái đặt bàn (RM-101) */}
      {statusTargetReservation && (
        <ReservationStatusModal
          isOpen={statusTargetReservation !== null}
          reservationId={statusTargetReservation.id}
          currentStatus={statusTargetReservation.status}
          reservationCode={statusTargetReservation.reservationCode}
          onClose={() => setStatusTargetReservation(null)}
          onSuccess={() => {
            setStatusTargetReservation(null);
          }}
        />
      )}
    </div>
  );
}
