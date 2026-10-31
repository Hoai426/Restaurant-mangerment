package restaurant_management_be.dto.tables;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableCreateRequest {

    @NotNull(message = "Mã phòng không được để trống")
    private Long roomId;

    @NotBlank(message = "Số bàn không được để trống")
    @Size(max = 20, message = "Số bàn tối đa 20 ký tự")
    private String tableNumber;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa phải lớn hơn 0")
    private Integer capacity;
}