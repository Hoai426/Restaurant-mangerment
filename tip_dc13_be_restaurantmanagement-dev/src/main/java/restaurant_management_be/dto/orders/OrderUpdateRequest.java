package restaurant_management_be.dto.orders;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class OrderUpdateRequest {

    private Long tableId;

    @Min(value = 1, message = "Số khách phải lớn hơn 0")
    private Integer numberOfGuests;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String note;

    private boolean noteProvided;

    @NotEmpty(message = "Đơn hàng phải có ít nhất một món ăn")
    @Valid
    private List<OrderItemCreateRequest> items;

    @JsonCreator
    public OrderUpdateRequest(
            @JsonProperty("tableId") Long tableId,
            @JsonProperty("numberOfGuests") Integer numberOfGuests,
            @JsonProperty("note") String note,
            @JsonProperty("items") List<OrderItemCreateRequest> items) {
        this.tableId = tableId;
        this.numberOfGuests = numberOfGuests;
        this.note = note;
        this.noteProvided = true;
        this.items = items;
    }
}
