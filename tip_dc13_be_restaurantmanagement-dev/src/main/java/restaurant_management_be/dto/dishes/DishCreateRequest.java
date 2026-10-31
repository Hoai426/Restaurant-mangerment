package restaurant_management_be.dto.dishes;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DishCreateRequest {

    @NotBlank(message = "Tên món ăn không được để trống")
    @Size(max = 150, message = "Tên món ăn tối đa 150 ký tự")
    private String name;

    @Size(max = 65535, message = "Mô tả quá dài")
    private String description;

    @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
    private String imageUrl;

    @NotNull(message = "Giá món ăn không được để trống")
    @Positive(message = "Giá món ăn phải lớn hơn 0")
    private BigDecimal price;

    @NotEmpty(message = "Danh mục không được để trống")
    private List<Long> categoryIds;
}