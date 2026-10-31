// Draft/mock domain model.
// Must be aligned with the official backend Order API when available.

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

// Cart/UI Model: Dùng nội bộ cho giao diện hiển thị và tính toán ở Frontend
export interface CartItem {
  dishId: number;
  dishName: string;
  price: number; // Dùng để hiển thị giá, tính subtotal và totalAmount trên UI
  quantity: number;
  note?: string; // Ghi chú riêng cho món (ví dụ: "ít cay", "không hành")
  imageUrl?: string;
  isAvailable: boolean;
}

// Draft Request DTO gửi lên Mock Service (RM-63)
export interface CreateOrderItemRequest {
  dishId: number;
  quantity: number;
  note?: string;
  price?: number; // CHỈ phục vụ Mock Service tính nhẩm, KHÔNG xem là Backend contract chính thức
}

export interface CreateOrderRequest {
  tableId: number;
  numberOfGuests?: number;
  note?: string;
  items: CreateOrderItemRequest[];
}

// Draft Request DTO gửi lên Server cho Update Order (RM-148 - Full Snapshot, KHÔNG chứa price)
export interface UpdateOrderItemRequest {
  dishId: number;
  quantity: number;
  note: string | null;
}

export interface UpdateOrderRequest {
  tableId?: number;
  numberOfGuests: number | null;
  note: string | null;
  items: UpdateOrderItemRequest[];
}

// Initial data truyền vào useOrderCart khi mở UpdateOrderModal
export interface OrderCartInitialData {
  tableId?: number | null;
  numberOfGuests?: number | null;
  orderNote?: string | null;
  items?: CartItem[];
}

// Response DTOs: Chuẩn hóa non-optional keys cho các trường nullable
export interface OrderItemResponse {
  id: number;
  dishId: number;
  dishName: string;
  price: number;
  quantity: number;
  subtotal: number;
  note: string | null; // Bắt buộc có key trong response
}

export interface OrderResponse {
  id: number;
  orderCode: string; // Mock format: ORD-YYYYMMDD-XXXX (Backend thật sẽ là source of truth)
  tableId: number;
  tableNumber: string;
  roomName?: string;
  status: OrderStatus;
  numberOfGuests: number | null; // Bắt buộc có key trong response, cho phép null
  totalAmount: number; // Mock calculation (Backend thật sẽ tự tính toán và là source of truth)
  note: string | null; // Bắt buộc có key trong response, cho phép null
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

import type { PaymentResponse } from "./payment";

export interface OrderDetailModalProps {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (order: OrderResponse) => void;
  onPaymentOrder?: (order: OrderResponse) => void;
  onConfirmPayment?: (payment: PaymentResponse) => void;
  isPaymentCreatedInSession?: boolean;
}

// RM-150: Update Order Status type (chặn PENDING)
export type UpdatableOrderStatus = Exclude<OrderStatus, "PENDING">;

export interface UpdateOrderStatusRequest {
  status: UpdatableOrderStatus;
}

// RM-150: UI Filter state cho Order Management
export interface OrderFilterState {
  orderCode: string;
  status: OrderStatus | "ALL";
  tableId: number | null;
  createdAt: string; // YYYY-MM-DD
}

