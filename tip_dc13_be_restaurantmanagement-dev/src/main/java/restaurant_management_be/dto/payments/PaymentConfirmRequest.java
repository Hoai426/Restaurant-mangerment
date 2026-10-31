package restaurant_management_be.dto.payments;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import restaurant_management_be.entities.Payment;

@Data
public class PaymentConfirmRequest {

    @NotNull(message = "Trạng thái xác nhận không được để trống")
    private Payment.Status status;
}
