package restaurant_management_be.dto.rooms;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomUpdateStatusRequest {

    @NotNull(message = "Trạng thái phòng không được để trống")
    private Boolean isActive;
}