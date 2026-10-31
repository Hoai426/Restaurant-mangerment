package restaurant_management_be.dto.tables;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableUpdateRequest {

    private Long roomId;

    @Size(max = 20, message = "Số bàn tối đa 20 ký tự")
    private String tableNumber;

    @Min(value = 1, message = "Sức chứa phải lớn hơn 0")
    private Integer capacity;
}