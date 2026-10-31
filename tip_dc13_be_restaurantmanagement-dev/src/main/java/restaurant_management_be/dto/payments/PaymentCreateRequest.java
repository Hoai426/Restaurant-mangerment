package restaurant_management_be.dto.payments;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import restaurant_management_be.entities.Payment;

@Data
public class PaymentCreateRequest {

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private Payment.PaymentMethod paymentMethod;
}
