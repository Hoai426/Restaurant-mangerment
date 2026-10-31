export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export interface ReservationResponse {
  id: number;
  reservationCode: string;
  customerId?: number | null;
  customerName: string;
  customerPhone: string;
  createdById?: number | null;
  createdByName?: string | null;
  createdByRole?: string | null;
  tableId: number;
  tableNumber: string;
  roomId: number;
  roomName: string;
  reservationDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfGuests: number;
  status: ReservationStatus;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationCreateRequest {
  tableIds: number[];
  customerPhone: string;
  customerName: string;
  reservationDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  numberOfGuests: number;
  note?: string;
}

export interface ReservationCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTableId?: number | null;
  onSuccess?: (reservations: ReservationResponse[]) => void;
}

export interface ReservationUpdateRequest {
  reservationDate?: string; // yyyy-MM-dd
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  numberOfGuests?: number;
  note?: string | null;
  customerPhone?: string;
  customerName?: string;
  tableIds?: number[];
}

export interface ReservationUpdateModalProps {
  reservationId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (reservations: ReservationResponse[]) => void;
}

export interface ReservationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: number | null;
  onEdit?: (reservationId: number) => void;
  onUpdateStatus?: (reservation: {
    id: number;
    status: ReservationStatus;
    reservationCode: string;
  }) => void;
}

export type UpdatableReservationStatus =
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export interface ReservationUpdateStatusRequest {
  status: UpdatableReservationStatus;
}

export interface ReservationStatusModalProps {
  isOpen: boolean;
  reservationId: number | null;
  currentStatus: ReservationStatus;
  reservationCode?: string;
  onClose: () => void;
  onSuccess?: (updatedList: ReservationResponse[]) => void;
}

