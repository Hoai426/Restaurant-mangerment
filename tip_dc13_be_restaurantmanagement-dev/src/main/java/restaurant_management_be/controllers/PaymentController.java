package restaurant_management_be.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.dto.payments.PaymentConfirmRequest;
import restaurant_management_be.dto.payments.PaymentCreateRequest;
import restaurant_management_be.dto.payments.PaymentResponse;
import restaurant_management_be.services.PaymentService;
import java.util.List;

@RestController
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/api/orders/{orderId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SuccessResponse<PaymentResponse>> createPayment(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentCreateRequest request) {
        PaymentResponse result = paymentService.createPayment(orderId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("Tạo thanh toán thành công", result));
    }

    @GetMapping("/api/orders/{orderId}/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SuccessResponse<PaymentResponse>> getPaymentByOrderId(
            @PathVariable Long orderId) {
        PaymentResponse result = paymentService.getPaymentByOrderId(orderId);
        return ResponseEntity.ok(SuccessResponse.ok(result));
    }

    @GetMapping("/api/payments")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SuccessResponse<List<PaymentResponse>>> getAllPayments() {
        return ResponseEntity.ok(SuccessResponse.ok(paymentService.getAllPayments()));
    }

    @PatchMapping("/api/orders/{orderId}/payments/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SuccessResponse<PaymentResponse>> confirmPayment(
            @PathVariable Long orderId,
            @Valid @RequestBody PaymentConfirmRequest request) {
        PaymentResponse result = paymentService.confirmPayment(orderId, request);
        return ResponseEntity.ok(SuccessResponse.ok("Xác nhận thanh toán thành công", result));
    }
}
