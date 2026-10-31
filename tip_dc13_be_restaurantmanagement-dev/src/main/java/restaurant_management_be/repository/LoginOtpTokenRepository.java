package restaurant_management_be.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import restaurant_management_be.entities.LoginOtpToken;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface LoginOtpTokenRepository
        extends JpaRepository<LoginOtpToken, Long> {

    Optional<LoginOtpToken> findByTempToken(String tempToken);

    List<LoginOtpToken> findByPurposeAndTarget(String purpose, String target);

    List<LoginOtpToken> findByPurpose(String purpose);

    long deleteByExpiresAtBefore(LocalDateTime expiry);

    @Modifying
    @Query("UPDATE LoginOtpToken SET attemptCount = attemptCount + 1 "
            + "WHERE tempToken = :tempToken AND attemptCount < :maxAttempts AND used = false")
    int incrementAttempts(@Param("tempToken") String tempToken,
            @Param("maxAttempts") int maxAttempts);

    @Modifying
    @Query("DELETE FROM LoginOtpToken WHERE tempToken = :tempToken AND used = false")
    int deleteIfUnused(@Param("tempToken") String tempToken);

    @Modifying
    @Query("UPDATE LoginOtpToken SET otpCode = :otpCode, expiresAt = :expiresAt, attemptCount = 0 "
            + "WHERE tempToken = :tempToken AND purpose = :purpose AND used = false")
    int refreshOtp(@Param("tempToken") String tempToken,
            @Param("purpose") String purpose,
            @Param("otpCode") String otpCode,
            @Param("expiresAt") LocalDateTime expiresAt);

    @Modifying
    @Query("UPDATE LoginOtpToken SET used = true, expiresAt = :newExpiry "
            + "WHERE tempToken = :tempToken AND used = false")
    int markUsed(@Param("tempToken") String tempToken,
            @Param("newExpiry") LocalDateTime newExpiry);
}
