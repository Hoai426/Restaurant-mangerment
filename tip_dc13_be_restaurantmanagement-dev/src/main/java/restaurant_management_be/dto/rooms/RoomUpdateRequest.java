package restaurant_management_be.dto.rooms;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUpdateRequest {

    private Long categoryId;

    @Size(max = 50, message = "Tên phòng tối đa 50 ký tự")
    private String name;

    @Size(max = 100, message = "Mô tả tối đa 100 ký tự")
    private String description;

    @Size(max = 100, message = "Đường dẫn ảnh tối đa 100 ký tự")
    private String imageUrl;
}