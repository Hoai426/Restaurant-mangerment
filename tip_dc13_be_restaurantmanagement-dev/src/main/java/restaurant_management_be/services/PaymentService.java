package restaurant_management_be.services;

import restaurant_management_be.dto.payments.PaymentConfirmRequest;
import restaurant_management_be.dto.payments.PaymentCreateRequest;
import restaurant_management_be.dto.payments.PaymentResponse;
import java.util.List;

public interface PaymentService {
    PaymentResponse createPayment(Long orderId, PaymentCreateRequest request);

    boolean hasSuccessfulPayment(Long orderId);
    PaymentResponse getPaymentByOrderId(Long orderId);
    List<PaymentResponse> getAllPayments();

    PaymentResponse confirmPayment(Long orderId, PaymentConfirmRequest request);
}
