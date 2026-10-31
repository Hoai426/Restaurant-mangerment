package restaurant_management_be.dto.orders;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class OrderCreateRequest {

    @NotNull(message = "Bàn không được để trống")
    private Long tableId;

    @Min(value = 1, message = "Số khách phải lớn hơn 0")
    private Integer numberOfGuests;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String note;

    @NotEmpty(message = "Đơn hàng phải có ít nhất một món ăn")
    @Valid
    private List<OrderItemCreateRequest> items;
}
