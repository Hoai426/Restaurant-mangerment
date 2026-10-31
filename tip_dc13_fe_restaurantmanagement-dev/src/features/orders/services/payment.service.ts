import { apiClient } from "@/services/api-client";
import { authHeader } from "@/utils/auth";
import type {
  CreatePaymentRequest,
  ConfirmPaymentRequest,
  PaymentResponse,
} from "@/types/payment";

export const paymentService = {
  /**
   * Tạo giao dịch thanh toán cho đơn hàng
   * POST /api/orders/{orderId}/payments
   */
  async createPayment(
    orderId: number,
    payload: CreatePaymentRequest
  ): Promise<PaymentResponse> {
    return apiClient<PaymentResponse>(`/api/orders/${orderId}/payments`, {
      method: "POST",
      body: payload,
      headers: authHeader(),
    });
  },

  /**
   * Xác nhận thanh toán cho đơn hàng
   * PATCH /api/orders/{orderId}/payments/confirm
   */
  async confirmPayment(
    orderId: number,
    payload: ConfirmPaymentRequest = { status: "SUCCESS" }
  ): Promise<PaymentResponse> {
    return apiClient<PaymentResponse>(`/api/orders/${orderId}/payments/confirm`, {
      method: "PATCH",
      body: payload,
      headers: authHeader(),
    });
  },

  /**
   * Lấy thông tin thanh toán theo mã đơn hàng
   * GET /api/orders/{orderId}/payments
   */
  async getPaymentByOrderId(orderId: number): Promise<PaymentResponse> {
    return apiClient<PaymentResponse>(`/api/orders/${orderId}/payments`, {
      method: "GET",
      headers: authHeader(),
    });
  },

  /**
   * Lấy toàn bộ danh sách giao dịch thanh toán
   * GET /api/payments
   */
  async getAllPayments(): Promise<PaymentResponse[]> {
    return apiClient<PaymentResponse[]>(`/api/payments`, {
      method: "GET",
      headers: authHeader(),
    });
  },
};

