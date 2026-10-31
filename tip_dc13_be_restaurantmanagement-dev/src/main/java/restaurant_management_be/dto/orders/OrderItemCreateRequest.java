package restaurant_management_be.dto.orders;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OrderItemCreateRequest {

    @NotNull(message = "Món ăn không được để trống")
    private Long dishId;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;

    @Size(max = 200, message = "Ghi chú món tối đa 200 ký tự")
    private String note;
}
