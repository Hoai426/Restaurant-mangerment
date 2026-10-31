export interface Room {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomCreateRequest {
  categoryId: number;
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface RoomUpdateRequest {
  categoryId?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
}

export interface RoomCategory {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RoomUpdateStatusRequest {
  isActive: boolean;
}

export interface RoomCategoryUpdateStatusRequest {
  isActive: boolean;
}

export interface RoomCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (room: Room) => void;
}

export interface RoomDetailModalProps {
  roomId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (room: Room) => void;
  onToggleStatus?: (room: Room) => void;
  onEditTable?: (table: import("./table").RestaurantTable) => void;
  onViewTableDetails?: (tableId: number) => void;
  canEdit?: boolean;
}

export interface RoomStatusModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedRoom: Room) => void;
}

export interface RoomFilterProps {
  categories: RoomCategory[];
  selectedCategoryId: number | null;
  searchQuery: string;
  isCategoriesLoading?: boolean;
  isCategoriesError?: boolean;
  onCategoryChange: (categoryId: number | null) => void;
  onSearchChange: (search: string) => void;
  onReset: () => void;
}

export type {
  FilterOperation,
  FilterCriteria,
  SortCriteria,
  SearchRequest,
  PageResponse,
} from "./search";

