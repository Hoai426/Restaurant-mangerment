package restaurant_management_be.dto.otp;

import java.time.LocalDateTime;

public record OtpSession(
        String tempToken,
        String otpCode,
        LocalDateTime expiresAt,
        int attemptCount,
        Object payload) {
}
