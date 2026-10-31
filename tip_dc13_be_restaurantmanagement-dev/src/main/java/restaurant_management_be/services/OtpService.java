package restaurant_management_be.services;

import restaurant_management_be.dto.otp.OtpPurpose;
import restaurant_management_be.dto.otp.OtpSession;
import restaurant_management_be.entities.User;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.function.Predicate;

public interface OtpService {

    OtpSession issue(OtpPurpose purpose, String target, Object payload);

    OtpSession issue(User user, OtpPurpose purpose, String target, Object payload);

    Optional<OtpSession> get(String tempToken);

    Optional<OtpSession> findFirst(OtpPurpose purpose, String target);

    Object verify(OtpPurpose purpose, String tempToken, String otpCode, String retryHint);

    void hold(String tempToken, LocalDateTime extendedExpiry);

    String resend(OtpPurpose purpose, String tempToken);

    void remove(String tempToken);

    void consume(String tempToken);

    void removeIf(OtpPurpose purpose, Predicate<OtpSession> predicate);
}
