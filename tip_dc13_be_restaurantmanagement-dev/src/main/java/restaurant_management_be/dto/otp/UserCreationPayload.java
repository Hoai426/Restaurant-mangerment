package restaurant_management_be.dto.otp;

import restaurant_management_be.entities.User;

public record UserCreationPayload(String username, String fullName, String email, String phone,
        User.Role role, Boolean isActive, String encodedPassword) {
}
