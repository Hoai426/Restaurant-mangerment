package restaurant_management_be.dto.orders;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {

    private Long id;
    private Long dishId;
    private String dishName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private String note;
}
