package restaurant_management_be.dto.orders;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import restaurant_management_be.entities.Order;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateStatusRequest {

    @NotNull(message = "Trạng thái đơn hàng không được để trống")
    private Order.Status status;
}