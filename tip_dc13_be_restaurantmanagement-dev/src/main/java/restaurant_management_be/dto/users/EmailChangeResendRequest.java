package restaurant_management_be.dto.users;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailChangeResendRequest {

    @NotBlank(message = "TempToken không được để trống")
    private String tempToken;
}
