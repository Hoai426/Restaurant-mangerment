package restaurant_management_be.dto.rooms;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomCreateRequest {

    @NotNull(message = "Loại phòng không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tên phòng không được để trống")
    @Size(max = 100, message = "Tên phòng tối đa 100 ký tự")
    private String name;

    @Size(max = 100, message = "Mô tả tối đa 100 ký tự")
    private String description;

    @Size(max = 500, message = "Đường dẫn ảnh tối đa 500 ký tự")
    private String imageUrl;
}
