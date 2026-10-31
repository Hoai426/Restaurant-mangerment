"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  TableCellsIcon,
  PlusIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { getAccessToken } from "@/utils/cookie";
import { getRoleFromToken } from "@/utils/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getApiErrorMessage } from "@/utils/getApiErrorMessage";
import {
  useTables,
  TableFilterBar,
  TableGrid,
  TableCreateModal,
  TableUpdateModal,
  TableDetailModal,
  TableStatusModal,
} from "@/features/tables";
import {
  ReservationCreateModal,
  ReservationUpdateModal,
  ReservationDetailModal,
  reservationService,
} from "@/features/reservations";
import { useRooms } from "@/features/rooms";
import type {
  RestaurantTable,
  TableStatus,
  SearchRequest,
  FilterCriteria,
} from "@/types/table";

export default function TablesPage() {
  const { role } = useRequireAuth(["ADMIN", "STAFF"]);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [reservationPreselectedTableId, setReservationPreselectedTableId] = useState<number | null>(null);
  const [viewingTableId, setViewingTableId] = useState<number | null>(null);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [statusingTable, setStatusingTable] = useState<RestaurantTable | null>(null);
  const [editingReservationId, setEditingReservationId] = useState<number | null>(null);
  const [viewingReservationId, setViewingReservationId] = useState<number | null>(null);
  const [isResolvingReservation, setIsResolvingReservation] = useState(false);
  const [resolveReservationError, setResolveReservationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter states (RM-96)
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [capacityFilter, setCapacityFilter] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TableStatus | "ALL">("ALL");

  // 350ms debounce for tableNumber search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Authentication & Permissions
  const token = getAccessToken();
  const tokenRole = token ? getRoleFromToken(token) : null;
  const currentRole = role || tokenRole;
  const isAdmin = currentRole === "ADMIN";
  const isStaff = currentRole === "STAFF";

  // ADMIN can create tables; STAFF cannot create tables
  const canCreate = isAdmin;
  const canUpdateStatus = isAdmin || isStaff;
  const canEditTable = (table: RestaurantTable): boolean => {
    if (isAdmin) return true;
    if (isStaff && table.status === "RESERVED") return true;
    return false;
  };

  // Helper resolving active reservation for a RESERVED table (DRY optimization)
  const resolveActiveReservationId = async (
    table: RestaurantTable
  ): Promise<number | null> => {
    try {
      setIsResolvingReservation(true);
      setResolveReservationError(null);
      const activeReservation =
        await reservationService.getActiveReservationByTableId(table.id);
      if (activeReservation?.id) {
        return activeReservation.id;
      }
      setResolveReservationError(
        `Không tìm thấy đơn đặt bàn cho Bàn ${table.tableNumber} hoặc đơn đã bị hủy.`
      );
      return null;
    } catch (err) {
      const errorInfo = getApiErrorMessage(err);
      setResolveReservationError(errorInfo.message);
      return null;
    } finally {
      setIsResolvingReservation(false);
    }
  };

  const handleEditTable = async (table: RestaurantTable) => {
    if (table.status === "RESERVED") {
      if (!isAdmin && !isStaff) return;
      const resId = await resolveActiveReservationId(table);
      if (resId) {
        setEditingReservationId(resId);
      }
    } else {
      if (!isAdmin) return;
      setEditingTable(table);
    }
  };

  const handleViewReservationDetail = async (table: RestaurantTable) => {
    if (table.status !== "RESERVED") return;
    if (!isAdmin && !isStaff) return;
    const resId = await resolveActiveReservationId(table);
    if (resId) {
      setViewingTableId(null);
      setViewingReservationId(resId);
    }
  };

  // Build SearchRequest: tableNumber (LIKE), capacity (GTE), room.id (EQ)
  // Status is intentionally excluded from backend search to protect stats integrity and avoid enum criteria dependency
  const searchRequest = useMemo<SearchRequest>(() => {
    const filters: FilterCriteria[] = [];

    if (debouncedSearchTerm.trim()) {
      filters.push({
        field: "tableNumber",
        operation: "LIKE",
        value: debouncedSearchTerm.trim(),
      });
    }

    if (capacityFilter !== null && capacityFilter > 0) {
      filters.push({
        field: "capacity",
        operation: "GTE",
        value: capacityFilter,
      });
    }

    if (selectedRoomId !== null) {
      filters.push({
        field: "room.id",
        operation: "EQ",
        value: selectedRoomId,
      });
    }

    return {
      filters,
      sorts: [
        { field: "tableNumber", direction: "ASC" },
      ],
    };
  }, [debouncedSearchTerm, capacityFilter, selectedRoomId]);

  // Data fetching via feature hooks
  const {
    data: tables = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useTables(searchRequest);

  const { data: rooms = [], isLoading: isRoomsLoading } = useRooms();


  // Client-side status filtering for TableGrid display
  const displayedTables = useMemo(() => {
    if (selectedStatus === "ALL") return tables;
    return tables.filter((t) => t.status === selectedStatus);
  }, [tables, selectedStatus]);

  const isFiltered =
    Boolean(searchTerm.trim()) ||
    capacityFilter !== null ||
    selectedRoomId !== null ||
    selectedStatus !== "ALL";

  const handleResetFilter = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setCapacityFilter(null);
    setSelectedRoomId(null);
    setSelectedStatus("ALL");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rms-gold/10 text-rms-gold">
              <TableCellsIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-rms-charcoal tracking-tight">
                Quản lý bàn ăn
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Theo dõi tình trạng phục vụ, vị trí phòng và sức chứa của các bàn ăn
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setReservationPreselectedTableId(null);
              setIsReservationOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-rms-burgundy bg-rms-burgundy/10 hover:bg-rms-burgundy/15 active:scale-95 transition-all rounded-xl cursor-pointer"
          >
            <CalendarDaysIcon className="w-5 h-5 text-rms-burgundy" />
            <span>Đặt bàn mới</span>
          </button>

          {canCreate && (
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient hover:-translate-y-0.5 transition-all shadow-sm cursor-pointer"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Thêm bàn mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircleIcon className="w-6 h-6 text-emerald-600 shrink-0" />
            <span className="font-semibold text-sm">{successMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-lg hover:bg-emerald-100/60 transition-colors cursor-pointer"
            aria-label="Đóng thông báo"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Reservation Resolution Error Notification Banner */}
      {resolveReservationError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between shadow-xs animate-fade-in">
          <div className="flex items-center gap-3">
            <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 shrink-0" />
            <span className="font-semibold text-sm">{resolveReservationError}</span>
          </div>
          <button
            type="button"
            onClick={() => setResolveReservationError(null)}
            className="text-amber-700 hover:text-amber-900 p-1 rounded-lg hover:bg-amber-100/60 transition-colors cursor-pointer"
            aria-label="Đóng thông báo lỗi"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Resolving Reservation Loading State */}
      {isResolvingReservation && (
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-3 shadow-xs animate-fade-in">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0" />
          <span className="font-semibold text-xs sm:text-sm">Đang tra cứu thông tin đặt bàn...</span>
        </div>
      )}


      {/* Table Filter Bar (RM-96) */}
      <TableFilterBar
        rooms={rooms}
        isRoomsLoading={isRoomsLoading}
        searchTerm={searchTerm}
        capacityFilter={capacityFilter}
        selectedRoomId={selectedRoomId}
        selectedStatus={selectedStatus}
        onSearchChange={setSearchTerm}
        onCapacityChange={setCapacityFilter}
        onSelectRoomId={setSelectedRoomId}
        onSelectStatus={setSelectedStatus}
        onResetFilter={handleResetFilter}
        isFiltered={isFiltered}
      />

      {/* Main Content with AsyncStateView */}
      <AsyncStateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        loadingMessage="Đang tải danh sách bàn ăn..."
      >
        <TableGrid
          tables={displayedTables}
          totalCount={tables.length}
          canCreate={canCreate}
          canEdit={canEditTable}
          canUpdateStatus={canUpdateStatus}
          onCreateTable={() => setIsCreateOpen(true)}
          onViewDetail={(id) => setViewingTableId(id)}
          onEdit={handleEditTable}
          onUpdateStatus={(table) => setStatusingTable(table)}
          onResetFilter={handleResetFilter}
        />
      </AsyncStateView>

      {/* Table Reservation Modal (RM-97) */}
      {isReservationOpen && (
        <ReservationCreateModal
          isOpen={isReservationOpen}
          preselectedTableId={reservationPreselectedTableId}
          onClose={() => {
            setIsReservationOpen(false);
            setReservationPreselectedTableId(null);
          }}
          onSuccess={(reservations) => {
            const code = reservations[0]?.reservationCode || "";
            const count = reservations.length;
            setSuccessMessage(
              `Đặt bàn thành công! Mã đặt chỗ: ${code} (${count} bàn)`
            );
          }}
        />
      )}

      {/* Reservation Detail Modal (RM-99) */}
      {viewingReservationId !== null && (
        <ReservationDetailModal
          isOpen={viewingReservationId !== null}
          reservationId={viewingReservationId}
          onClose={() => setViewingReservationId(null)}
          onEdit={(resId) => {
            setViewingReservationId(null);
            setEditingReservationId(resId);
          }}
        />
      )}

      {/* Reservation Update Modal (RM-98) */}
      {editingReservationId !== null && (
        <ReservationUpdateModal
          isOpen={editingReservationId !== null}
          reservationId={editingReservationId}
          onClose={() => setEditingReservationId(null)}
          onSuccess={(reservations) => {
            const code = reservations[0]?.reservationCode || "";
            setSuccessMessage(
              `Đã cập nhật thông tin đặt bàn ${code} thành công!`
            );
          }}
        />
      )}

      {/* Table Create Modal */}
      {canCreate && isCreateOpen && (
        <TableCreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSuccess={(newTable) => {
            setSuccessMessage(
              newTable?.tableNumber
                ? `Đã tạo bàn ${newTable.tableNumber} thành công`
                : "Đã tạo bàn thành công"
            );
          }}
        />
      )}

      {/* Table Detail Modal (RM-94) */}
      <TableDetailModal
        isOpen={viewingTableId !== null}
        tableId={viewingTableId}
        onClose={() => setViewingTableId(null)}
        canEdit={canEditTable}
        onEdit={(table) => {
          setViewingTableId(null);
          handleEditTable(table);
        }}
        onViewReservationDetail={handleViewReservationDetail}
      />

      {/* Table Update Modal (RM-93) */}
      {editingTable && (
        <TableUpdateModal
          isOpen={editingTable !== null}
          table={editingTable}
          onClose={() => setEditingTable(null)}
          onSuccess={(updatedTable) => {
            setSuccessMessage(
              updatedTable?.tableNumber
                ? `Đã cập nhật bàn ${updatedTable.tableNumber} thành công`
                : "Đã cập nhật thông tin bàn thành công"
            );
          }}
        />
      )}

      {/* Table Status Modal (RM-95) */}
      {statusingTable && (
        <TableStatusModal
          isOpen={statusingTable !== null}
          table={statusingTable}
          onClose={() => setStatusingTable(null)}
          onSuccess={(updatedTable) => {
            setSuccessMessage(
              updatedTable?.tableNumber
                ? `Đã cập nhật trạng thái bàn ${updatedTable.tableNumber} thành công`
                : "Đã cập nhật trạng thái bàn thành công"
            );
          }}
        />
      )}
    </div>
  );
}
