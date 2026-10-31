import type { Room } from "./room";

export type TableStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED";

export interface RestaurantTable {
  id: number;
  roomId: number;
  roomName?: string | null;
  tableNumber: string;
  capacity: number;
  status: TableStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TableCreateRequest {
  roomId: number;
  tableNumber: string;
  capacity: number;
}

export interface TableCreateModalProps {
  isOpen: boolean;
  roomId?: number;
  roomName?: string;
  onClose: () => void;
  onSuccess?: (table: RestaurantTable) => void;
}

export interface TableUpdateRequest {
  roomId?: number;
  tableNumber?: string;
  capacity?: number;
}

export interface TableUpdateFormProps {
  table: RestaurantTable;
  rooms: Room[];
  isRoomsLoading?: boolean;
  isSubmitting: boolean;
  serverError: string | null;
  onSubmit: (payload: TableUpdateRequest) => void | Promise<void>;
  onCancel: () => void;
}

export interface TableUpdateModalProps {
  isOpen: boolean;
  table: RestaurantTable | null;
  onClose: () => void;
  onSuccess?: (updatedTable: RestaurantTable) => void;
}

export interface TableDetailModalProps {
  tableId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (table: RestaurantTable) => void;
  canEdit?: boolean | ((table: RestaurantTable) => boolean);
  onViewReservationDetail?: (table: RestaurantTable) => void;
}

export interface TableUpdateStatusRequest {
  status: TableStatus;
}

export interface TableStatusModalProps {
  table: RestaurantTable | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedTable: RestaurantTable) => void;
}

export interface TableFilterBarProps {
  rooms: Room[];
  isRoomsLoading: boolean;
  searchTerm: string;
  capacityFilter: number | null;
  selectedRoomId: number | null;
  selectedStatus: TableStatus | "ALL";
  onSearchChange: (value: string) => void;
  onCapacityChange: (capacity: number | null) => void;
  onSelectRoomId: (roomId: number | null) => void;
  onSelectStatus: (status: TableStatus | "ALL") => void;
  onResetFilter: () => void;
  isFiltered: boolean;
}

export type {
  SearchRequest,
  FilterCriteria,
  FilterOperation,
  SortCriteria,
  PageResponse,
} from "./search";
