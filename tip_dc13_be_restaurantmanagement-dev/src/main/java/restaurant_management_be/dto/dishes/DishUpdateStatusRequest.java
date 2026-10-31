package restaurant_management_be.dto.dishes;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DishUpdateStatusRequest {
    @NotNull(message = "Trạng thái món ăn không được để trống")
    private Boolean isAvailable;

}
