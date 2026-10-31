package restaurant_management_be.dto.otp;

public record EmailChangePayload(
        Long userId,
        String fullName,
        String phone,
        String newEmail,
        String encodedPassword) {
}
