/**
 * Phương thức thanh toán được hỗ trợ theo Backend enum Payment.PaymentMethod
 */
export type PaymentMethod = "CASH" | "CARD" | "QR";

/**
 * Trạng thái giao dịch theo Backend enum Payment.Status
 */
export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

/**
 * Payload gửi lên API POST /api/orders/{orderId}/payments
 * Chỉ gửi duy nhất paymentMethod. Amount do Backend tự động lấy từ order.totalAmount.
 */
export interface CreatePaymentRequest {
  paymentMethod: PaymentMethod;
}

/**
 * Payload gửi lên API PATCH /api/orders/{orderId}/payments/confirm
 * Chỉ chấp nhận duy nhất status là "SUCCESS" theo quy định Backend.
 */
export interface ConfirmPaymentRequest {
  status: "SUCCESS";
}

/**
 * DTO phản hồi từ Backend (PaymentResponse.java)
 */
export interface PaymentResponse {
  id: number;
  orderId: number;
  orderCode: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionCode: string;
  paidAt: string | null;
  createdAt: string;
  orderStatus: string | null;
}
