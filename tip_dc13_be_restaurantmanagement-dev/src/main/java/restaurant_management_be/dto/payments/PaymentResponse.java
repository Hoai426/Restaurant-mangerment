package restaurant_management_be.dto.payments;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import restaurant_management_be.entities.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long orderId;
    private String orderCode;
    private BigDecimal amount;
    private Payment.PaymentMethod paymentMethod;
    private Payment.Status status;
    private String transactionCode;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    private String orderStatus;
}
