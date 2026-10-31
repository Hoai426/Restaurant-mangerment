package restaurant_management_be.dto.otp;

public record RegisterPayload(String username, String fullName, String email, String phone,
        String encodedPassword) {
}
