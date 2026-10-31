package restaurant_management_be.dto.users;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateProfileResponse {

    private UserResponse user;

    private String emailChangeTempToken;
}
