"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BuildingOffice2Icon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { AsyncStateView } from "@/components/common/AsyncStateView";
import { getAccessToken } from "@/utils/cookie";
import { getRoleFromToken } from "@/utils/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import type { Room, SearchRequest, FilterCriteria } from "@/types/room";
import {
  useRooms,
  useRoomCategories,
  RoomFilter,
  RoomTable,
  RoomCreateModal,
  RoomUpdateModal,
  RoomDetailModal,
  RoomStatusModal,
} from "@/features/rooms";
import {
  TableUpdateModal,
  TableDetailModal,
} from "@/features/tables";
import type { RestaurantTable } from "@/types/table";

export default function RoomsPage() {
  useRequireAuth(["ADMIN", "STAFF"]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [togglingRoom, setTogglingRoom] = useState<Room | null>(null);
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null);
  const [viewingTableId, setViewingTableId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search & Filter state (RM-91)
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // 350ms debounce for search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const token = getAccessToken();
  const role = token ? getRoleFromToken(token) : null;
  const isAdmin = role === "ADMIN";
  const canCreate = isAdmin;
  const canEdit = isAdmin;

  // Fetch room categories for filter dropdown
  const {
    data: categories = [],
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useRoomCategories();

  // Construct SearchRequest dynamically
  const searchRequest = useMemo((): SearchRequest => {
    const filters: FilterCriteria[] = [];

    if (debouncedSearchQuery.trim()) {
      filters.push({
        field: "name",
        operation: "LIKE",
        value: debouncedSearchQuery.trim(),
      });
    }

    if (selectedCategoryId !== null) {
      filters.push({
        field: "category.id",
        operation: "EQ",
        value: Number(selectedCategoryId),
      });
    }

    return {
      filters,
      sorts: [{ field: "name", direction: "ASC" }],
    };
  }, [debouncedSearchQuery, selectedCategoryId]);

  const {
    data: rooms = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useRooms(searchRequest);

  const handleResetFilter = () => {
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setSelectedCategoryId(null);
  };

  const isFiltered =
    Boolean(searchQuery.trim()) || selectedCategoryId !== null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rms-gold/10 text-rms-gold">
              <BuildingOffice2Icon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-rms-charcoal tracking-tight">
              Quản lý phòng
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1 pl-10">
            Xem danh sách và quản lý các phòng ăn trong nhà hàng
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient hover:-translate-y-0.5 transition-all shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Thêm phòng mới</span>
          </button>
        )}
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

      {/* Room Filter Toolbar (RM-91) */}
      <RoomFilter
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        searchQuery={searchQuery}
        isCategoriesLoading={isCategoriesLoading}
        isCategoriesError={isCategoriesError}
        onCategoryChange={(catId) => setSelectedCategoryId(catId)}
        onSearchChange={(query) => setSearchQuery(query)}
        onReset={handleResetFilter}
      />

      {/* Main Content with AsyncStateView */}
      <AsyncStateView
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
        loadingMessage="Đang tải danh sách phòng..."
      >
        {rooms.length === 0 ? (
          isFiltered ? (
            /* Filtered Out Empty State */
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rms-gold/10 text-rms-gold flex items-center justify-center mb-3">
                <MagnifyingGlassIcon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-rms-charcoal mb-1">
                Không tìm thấy phòng ăn phù hợp
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Không có phòng ăn nào khớp với tiêu chí tìm kiếm hoặc loại phòng đã chọn. Vui lòng thử từ khóa khác hoặc xóa bộ lọc.
              </p>
              <button
                type="button"
                onClick={handleResetFilter}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </button>
            </div>
          ) : (
            /* Initial Zero Data State */
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-xs">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-rms-gold/10 text-rms-gold flex items-center justify-center mb-3">
                <BuildingOffice2Icon className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-rms-charcoal mb-1">
                Chưa có phòng ăn nào
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Hiện tại chưa có phòng ăn nào trong hệ thống. Hãy thêm phòng mới để bắt đầu quản lý.
              </p>
              {canCreate && (
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(true)}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white rounded-xl bg-rms-gradient shadow-sm hover:opacity-95 transition-opacity cursor-pointer"
                >
                  <PlusIcon className="w-5 h-5" />
                  Thêm phòng mới
                </button>
              )}
            </div>
          )
        ) : (
          <RoomTable
            rooms={rooms}
            canEdit={canEdit}
            onEdit={(room) => setEditingRoom(room)}
            onViewDetails={(roomId) => setSelectedRoomId(roomId)}
            onToggleStatus={canEdit ? (room) => setTogglingRoom(room) : undefined}
          />
        )}
      </AsyncStateView>

      {/* Room Detail Modal (RM-89) */}
      <RoomDetailModal
        roomId={selectedRoomId}
        isOpen={selectedRoomId !== null}
        onClose={() => setSelectedRoomId(null)}
        canEdit={canEdit}
        onViewTableDetails={(tableId) => {
          setSelectedRoomId(null);
          setViewingTableId(tableId);
        }}
        onEditTable={(table) => {
          setEditingTable(table);
        }}
        onEdit={(room) => {
          setSelectedRoomId(null);
          setEditingRoom(room);
        }}
        onToggleStatus={canEdit ? (room) => setTogglingRoom(room) : undefined}
      />

      {/* Room Create Modal (RM-87) */}
      <RoomCreateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(room) => {
          setSuccessMessage(`Đã tạo phòng thành công: ${room.name} (#${room.id})`);
        }}
      />

      {/* Room Update Modal (RM-88) */}
      <RoomUpdateModal
        isOpen={editingRoom !== null}
        room={editingRoom}
        onClose={() => setEditingRoom(null)}
        onSuccess={(updatedRoom) => {
          setSuccessMessage(`Đã cập nhật phòng thành công: ${updatedRoom.name} (#${updatedRoom.id})`);
        }}
      />

      {/* Room Status Modal (RM-90) */}
      <RoomStatusModal
        isOpen={togglingRoom !== null}
        room={togglingRoom}
        onClose={() => setTogglingRoom(null)}
        onSuccess={(updatedRoom) => {
          setSuccessMessage(
            updatedRoom.isActive
              ? `Đã kích hoạt phòng ${updatedRoom.name} (#${updatedRoom.id}) thành công`
              : `Đã tạm ngưng hoạt động phòng ${updatedRoom.name} (#${updatedRoom.id}) thành công`
          );
        }}
      />



      {/* Table Update Modal (RM-93) */}
      {editingTable && (
        <TableUpdateModal
          isOpen={editingTable !== null}
          table={editingTable}
          onClose={() => setEditingTable(null)}
          onSuccess={(updatedTable) => {
            setSuccessMessage(
              `Đã cập nhật bàn ${updatedTable.tableNumber} thành công`
            );
          }}
        />
      )}

      {/* Table Detail Modal (RM-94) */}
      <TableDetailModal
        isOpen={viewingTableId !== null}
        tableId={viewingTableId}
        onClose={() => setViewingTableId(null)}
        canEdit={isAdmin}
        onEdit={(table) => {
          setViewingTableId(null);
          setEditingTable(table);
        }}
      />
    </div>
  );
}
