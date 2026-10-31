package restaurant_management_be.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.dto.otp.*;
import restaurant_management_be.entities.LoginOtpToken;
import restaurant_management_be.entities.User;
import restaurant_management_be.repository.LoginOtpTokenRepository;
import restaurant_management_be.services.OtpService;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Predicate;

@Service
public class OtpServiceImpl implements OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final LoginOtpTokenRepository otpTokenRepository;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;

    @Value("${otp.expiration-minutes:5}")
    private int otpExpirationMinutes;

    @Value("${otp.max-attempts:3}")
    private int otpMaxAttempts;

    public OtpServiceImpl(LoginOtpTokenRepository otpTokenRepository, ObjectMapper objectMapper,
            PlatformTransactionManager transactionManager) {
        this.otpTokenRepository = otpTokenRepository;
        this.objectMapper = objectMapper;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.transactionTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Override
    @Transactional
    public OtpSession issue(OtpPurpose purpose, String target, Object payload) {
        return issue(null, purpose, target, payload);
    }

    @Override
    @Transactional
    public OtpSession issue(User user, OtpPurpose purpose, String target, Object payload) {
        otpTokenRepository.deleteByExpiresAtBefore(LocalDateTime.now());
        otpTokenRepository.findByPurposeAndTarget(purpose.name(), target)
                .forEach(old -> otpTokenRepository.deleteIfUnused(old.getTempToken()));

        LoginOtpToken token = new LoginOtpToken();
        token.setUser(user);
        token.setPurpose(purpose.name());
        token.setTarget(target);
        token.setPayload(toJson(payload));
        token.setOtpCode(generateCode());
        token.setTempToken(UUID.randomUUID().toString());
        token.setExpiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes));
        token.setUsed(false);
        token.setAttemptCount(0);
        otpTokenRepository.save(token);

        return toSession(token);
    }

    @Override
    public Optional<OtpSession> get(String tempToken) {
        return otpTokenRepository.findByTempToken(tempToken).map(this::toSession);
    }

    @Override
    public Optional<OtpSession> findFirst(OtpPurpose purpose, String target) {
        return otpTokenRepository.findByPurposeAndTarget(purpose.name(), target)
                .stream()
                .findFirst()
                .map(this::toSession);
    }

    /**
     * Các thao tác DB đi kèm ném lỗi (tăng lượt sai, xóa phiên hết hạn/khóa)
     * chạy trong TransactionTemplate REQUIRES_NEW để COMMIT trước khi throw —
     * nếu nằm trong transaction của verify thì exception sẽ roll back mất lượt sai.
     */
    @Override
    public Object verify(OtpPurpose purpose, String tempToken, String otpCode, String retryHint) {
        LoginOtpToken token = otpTokenRepository.findByTempToken(tempToken)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_OTP_SESSION_INVALID,
                        "Phiên OTP không hợp lệ hoặc không tồn tại", HttpStatus.BAD_REQUEST));

        if (!purpose.name().equals(token.getPurpose()))
            throw new AppException(ErrorCode.AUTH_OTP_SESSION_INVALID,
                    "Phiên OTP không hợp lệ hoặc không tồn tại", HttpStatus.BAD_REQUEST);

        if (token.isUsed())
            throw new AppException(ErrorCode.AUTH_OTP_ALREADY_USED, "OTP đã được sử dụng",
                    HttpStatus.CONFLICT);

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            transactionTemplate.executeWithoutResult(
                    s -> otpTokenRepository.deleteIfUnused(tempToken));
            throw new AppException(ErrorCode.AUTH_OTP_EXPIRED, expiredMessage(retryHint),
                    HttpStatus.BAD_REQUEST);
        }
        if (token.getAttemptCount() >= otpMaxAttempts) {
            transactionTemplate.executeWithoutResult(
                    s -> otpTokenRepository.deleteIfUnused(tempToken));
            throw new AppException(ErrorCode.AUTH_OTP_MAX_ATTEMPTS, exceededMessage(retryHint),
                    HttpStatus.TOO_MANY_REQUESTS);
        }
        if (!token.getOtpCode().equals(otpCode)) {
            int attempts = token.getAttemptCount() + 1;
            transactionTemplate.executeWithoutResult(
                    s -> otpTokenRepository.incrementAttempts(tempToken, otpMaxAttempts));
            int remaining = Math.max(otpMaxAttempts - attempts, 0);
            throw new AppException(ErrorCode.AUTH_OTP_INCORRECT,
                    "OTP không đúng. Còn " + remaining + " lần thử.", HttpStatus.BAD_REQUEST);
        }

        return readPayload(token);
    }

    @Override
    @Transactional
    public void hold(String tempToken, LocalDateTime extendedExpiry) {
        int updated = otpTokenRepository.markUsed(tempToken, extendedExpiry);
        if (updated == 0)
            throw new AppException(ErrorCode.AUTH_OTP_ALREADY_USED, "OTP đã được sử dụng",
                    HttpStatus.CONFLICT);
    }

    @Override
    @Transactional
    public String resend(OtpPurpose purpose, String tempToken) {
        String otpCode = generateCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpirationMinutes);
        int updated = otpTokenRepository.refreshOtp(tempToken, purpose.name(), otpCode, expiresAt);
        if (updated == 0)
            throw new AppException(ErrorCode.AUTH_OTP_SESSION_NOT_FOUND, "Không tìm thấy phiên OTP",
                    HttpStatus.NOT_FOUND);
        return otpCode;
    }

    @Override
    @Transactional
    public void remove(String tempToken) {
        otpTokenRepository.deleteIfUnused(tempToken);
    }

    @Override
    @Transactional
    public void consume(String tempToken) {
        int updated = otpTokenRepository.deleteIfUnused(tempToken);
        if (updated == 0)
            throw new AppException(ErrorCode.AUTH_OTP_SESSION_INVALID,
                    "Phiên OTP không hợp lệ hoặc không tồn tại", HttpStatus.BAD_REQUEST);
    }

    @Override
    @Transactional
    public void removeIf(OtpPurpose purpose, Predicate<OtpSession> predicate) {
        otpTokenRepository.findByPurpose(purpose.name()).stream()
                .map(this::toSession)
                .filter(predicate)
                .forEach(t -> otpTokenRepository.deleteIfUnused(t.tempToken()));
    }

    private String expiredMessage(String retryHint) {
        return "OTP đã hết hạn"
                + (retryHint == null || retryHint.isBlank() ? "" : ". " + retryHint);
    }

    private String exceededMessage(String retryHint) {
        return "Vượt quá số lần thử"
                + (retryHint == null || retryHint.isBlank() ? "" : ". " + retryHint);
    }

    private String generateCode() {
        return String.format("%06d", RANDOM.nextInt(1_000_000));
    }

    private String toJson(Object payload) {
        if (payload == null)
            return null;
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JacksonException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Không lưu được phiên OTP", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Object readPayload(LoginOtpToken token) {
        if (token.getPayload() == null || token.getPayload().isBlank())
            return null;
        OtpPurpose purpose;
        try {
            purpose = OtpPurpose.valueOf(token.getPurpose());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new AppException(ErrorCode.AUTH_OTP_SESSION_INVALID,
                    "Phiên OTP không hợp lệ hoặc không tồn tại", HttpStatus.BAD_REQUEST);
        }
        try {
            return switch (purpose) {
                case REGISTER -> objectMapper.readValue(token.getPayload(), RegisterPayload.class);
                case USER_CREATION -> objectMapper.readValue(token.getPayload(), UserCreationPayload.class);
                case EMAIL_CHANGE -> objectMapper.readValue(token.getPayload(), EmailChangePayload.class);
                case EMAIL_UPDATE -> objectMapper.readValue(token.getPayload(), EmailUpdatePayload.class);
                case FORGOT_PASSWORD -> null;
            };
        } catch (JacksonException e) {
            throw new AppException(ErrorCode.AUTH_OTP_SESSION_INVALID,
                    "Phiên OTP không hợp lệ hoặc không tồn tại", HttpStatus.BAD_REQUEST);
        }
    }

    private OtpSession toSession(LoginOtpToken token) {
        return new OtpSession(token.getTempToken(), token.getOtpCode(),
                token.getExpiresAt(), token.getAttemptCount(), readPayload(token));
    }
}
