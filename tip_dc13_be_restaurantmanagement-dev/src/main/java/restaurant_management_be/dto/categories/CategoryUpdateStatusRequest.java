package restaurant_management_be.dto.categories;

import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
@Data 
@NoArgsConstructor 
@AllArgsConstructor
public class CategoryUpdateStatusRequest {
    @NotNull (message = "Trạng thái danh mục không được để trống")
    private Boolean isActive;
}
