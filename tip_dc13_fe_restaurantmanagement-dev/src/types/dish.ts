export interface DishCategory {
  id: number;
  name: string;
}

export interface Dish {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  categories: DishCategory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDishRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  categoryIds: number[];
}

export interface UpdateDishRequest {
  name: string;
  categoryIds: number[];
  description?: string;
  imageUrl?: string;
  price?: number;
}

export interface UpdateDishStatusRequest {
  isAvailable: boolean;
}

// ─── Generic Search/Filter types (re-exported from ./search for backward compatibility) ────
export type {
  FilterOperation,
  FilterCriteria,
  SortCriteria,
  SearchRequest,
  PageResponse,
} from "./search";
