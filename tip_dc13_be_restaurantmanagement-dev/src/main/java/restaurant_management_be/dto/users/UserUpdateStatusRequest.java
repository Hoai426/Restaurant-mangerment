package restaurant_management_be.dto.users;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateStatusRequest {

    @NotNull(message = "Trạng thái tài khoản không được để trống")
    private Boolean isActive;
}