export type FilterOperation =
  | "EQ"
  | "NE"
  | "GT"
  | "GTE"
  | "LT"
  | "LTE"
  | "LIKE"
  | "IN";

export interface FilterCriteria {
  field: string;
  value: unknown;
  operation: FilterOperation;
}

export interface SortCriteria {
  field: string;
  direction: "ASC" | "DESC";
}

export interface SearchRequest {
  filters?: FilterCriteria[];
  sorts?: SortCriteria[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  last: boolean;
  size?: number;
  number?: number;
  first?: boolean;
  empty?: boolean;
}
