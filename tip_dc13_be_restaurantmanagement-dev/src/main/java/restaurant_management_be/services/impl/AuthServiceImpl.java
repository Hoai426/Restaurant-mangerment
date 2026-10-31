package restaurant_management_be.services.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.config.JwtService;
import restaurant_management_be.dto.auth.*;
import restaurant_management_be.dto.otp.EmailUpdatePayload;
import restaurant_management_be.dto.otp.OtpPurpose;
import restaurant_management_be.dto.otp.OtpSession;
import restaurant_management_be.dto.otp.RegisterPayload;
import restaurant_management_be.entities.*;
import restaurant_management_be.mapper.UserMapper;
import restaurant_management_be.repository.*;
import restaurant_management_be.services.AuthService;
import restaurant_management_be.services.EmailService;
import restaurant_management_be.services.OtpService;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository authRepository;
    private final JwtService jwtService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginOtpTokenRepository otpTokenRepository;
    private final EmailService emailService;
    private final UserMapper userMapper;
    private final OtpService otpService;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    public AuthServiceImpl(
            PasswordEncoder passwordEncoder,
            UserRepository authRepository,
            JwtService jwtService,
            RefreshTokenRepository refreshTokenRepository,
            LoginOtpTokenRepository otpTokenRepository,
            EmailService emailService,
            UserMapper userMapper,
            OtpService otpService) {
        this.passwordEncoder = passwordEncoder;
        this.authRepository = authRepository;
        this.jwtService = jwtService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpTokenRepository = otpTokenRepository;
        this.emailService = emailService;
        this.userMapper = userMapper;
        this.otpService = otpService;
    }

    @Override
    public OtpChallengeResponse register(RegisterRequest dto) {
        if (authRepository.findByUsername(dto.getUsername()).isPresent())
            throw new AppException(ErrorCode.AUTH_USERNAME_EXISTS, "Username đã tồn tại", HttpStatus.CONFLICT);
        if (authRepository.findByEmail(dto.getEmail()).isPresent())
            throw new AppException(ErrorCode.AUTH_EMAIL_EXISTS, "Email đã tồn tại", HttpStatus.CONFLICT);
        if (authRepository.findByPhone(dto.getPhone()).isPresent())
            throw new AppException(ErrorCode.AUTH_PHONE_EXISTS, "Số điện thoại đã tồn tại", HttpStatus.CONFLICT);

        OtpSession session = otpService.issue(OtpPurpose.REGISTER, dto.getEmail(),
                new RegisterPayload(dto.getUsername(), dto.getFullName(), dto.getEmail(), dto.getPhone(),
                        passwordEncoder.encode(dto.getPassword())));
        emailService.sendOtpEmail(dto.getEmail(), session.otpCode(), "Mã OTP Xác Nhận Đăng Ký");

        return new OtpChallengeResponse(session.tempToken());
    }

    @Override
    @Transactional
    public void verifyRegistrationOtp(OtpVerifyRequest dto) {
        RegisterPayload regDto = (RegisterPayload) otpService.verify(OtpPurpose.REGISTER, dto.getTempToken(),
                dto.getOtpCode(), "Vui lòng đăng ký lại.");
        if (authRepository.findByUsername(regDto.username()).isPresent())
            throw new AppException(ErrorCode.AUTH_USERNAME_EXISTS, "Username đã tồn tại", HttpStatus.CONFLICT);
        if (authRepository.findByEmail(regDto.email()).isPresent())
            throw new AppException(ErrorCode.AUTH_EMAIL_EXISTS, "Email đã tồn tại", HttpStatus.CONFLICT);
        if (authRepository.findByPhone(regDto.phone()).isPresent())
            throw new AppException(ErrorCode.AUTH_PHONE_EXISTS, "Số điện thoại đã tồn tại", HttpStatus.CONFLICT);

        User user = new User();
        user.setUsername(regDto.username());
        user.setPasswordHash(regDto.encodedPassword());
        user.setFullName(regDto.fullName());
        user.setEmail(regDto.email());
        user.setPhone(regDto.phone());
        user.setRole(User.Role.CUSTOMER);
        user.setActive(true);
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        authRepository.save(user);

        otpService.consume(dto.getTempToken());
    }

    @Override
    public OtpChallengeResponse resendRegistrationOtp(String email) {
        OtpSession session = otpService.findFirst(OtpPurpose.REGISTER, email)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_OTP_SESSION_NOT_FOUND,
                        "Không tìm thấy phiên đăng ký cho email này. Vui lòng đăng ký lại.", HttpStatus.NOT_FOUND));
        String tempToken = session.tempToken();

        String otpCode = otpService.resend(OtpPurpose.REGISTER, tempToken);

        emailService.sendOtpEmail(email, otpCode, "Mã OTP Xác Nhận Đăng Ký (Gửi lại)");
        return new OtpChallengeResponse(tempToken);
    }

    @Override
    @Transactional
    public OtpChallengeResponse forgotPassword(String email) {
        User user = authRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_EMAIL_NOT_FOUND,
                        "Email không tồn tại trong hệ thống", HttpStatus.NOT_FOUND));

        if (!user.isActive())
            throw new AppException(ErrorCode.AUTH_ACCOUNT_LOCKED, "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN);

        if (!user.isEmailVerified())
            throw new AppException(ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
                    "Email chưa được xác minh. Vui lòng đăng nhập để xác thực email trước khi khôi phục mật khẩu.",
                    HttpStatus.FORBIDDEN);

        OtpSession session = otpService.issue(user, OtpPurpose.FORGOT_PASSWORD, email, null);

        emailService.sendOtpEmail(email, session.otpCode(), "Mã OTP Khôi Phục Mật Khẩu");
        return new OtpChallengeResponse(session.tempToken());
    }

    @Override
    @Transactional
    public ResetChallengeResponse verifyForgotPasswordOtp(OtpVerifyRequest dto) {
        otpService.verify(OtpPurpose.FORGOT_PASSWORD, dto.getTempToken(), dto.getOtpCode(), null);
        otpService.hold(dto.getTempToken(), LocalDateTime.now().plusMinutes(10));

        return new ResetChallengeResponse(dto.getTempToken());
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest dto) {
        LoginOtpToken otp = otpTokenRepository.findByTempToken(dto.getResetToken())
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_RESET_SESSION_INVALID, "Phiên làm việc không hợp lệ",
                        HttpStatus.BAD_REQUEST));

        if (!otp.isUsed())
            throw new AppException(ErrorCode.AUTH_OTP_NOT_VERIFIED, "Chưa xác minh OTP", HttpStatus.BAD_REQUEST);
        if (otp.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new AppException(ErrorCode.AUTH_RESET_SESSION_EXPIRED,
                    "Phiên làm việc đã hết hạn. Vui lòng thao tác lại từ đầu.", HttpStatus.BAD_REQUEST);

        User user = otp.getUser();
        user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
        authRepository.save(user);

        otpTokenRepository.delete(otp);
        revokeUserSessions(user);
    }

    @Override
    @Transactional
    public LoginResponse login(LoginRequest dto) {
        User user = authRepository.findByUsernameOrEmail(dto.getIdentifier())
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_USER_NOT_FOUND, "Tài khoản không tồn tại",
                        HttpStatus.NOT_FOUND));

        if (!user.isActive())
            throw new AppException(ErrorCode.AUTH_ACCOUNT_LOCKED, "Tài khoản đã bị khóa", HttpStatus.FORBIDDEN);

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash()))
            throw new AppException(ErrorCode.AUTH_INVALID_PASSWORD, "Mật khẩu không đúng", HttpStatus.UNAUTHORIZED);

        if (!user.isEmailVerified()) {
            sendEmailUpdateOtp(user);
            throw new AppException(ErrorCode.AUTH_EMAIL_NOT_VERIFIED,
                    "Email chưa được xác minh. Mã OTP đã được gửi đến email của bạn, vui lòng kiểm tra và xác thực.",
                    HttpStatus.FORBIDDEN);
        }

        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole());
        String rawRefreshToken = jwtService.generateRefreshToken(user.getUsername());
        String tokenHash = jwtService.hashToken(rawRefreshToken);

        RefreshToken entity = new RefreshToken();
        entity.setUser(user);
        entity.setToken(tokenHash);
        entity.setExpiresAt(LocalDateTime.now().plusSeconds(refreshTokenExpiration / 1000));
        entity.setRevoked(false);
        refreshTokenRepository.save(entity);

        LoginResponse.UserResponse userResponse = userMapper.toUserResponse(user);
        return new LoginResponse(accessToken, rawRefreshToken, userResponse);
    }

    @Override
    @Transactional
    public String refreshAccessToken(String rawRefreshToken) {
        String tokenHash = jwtService.hashToken(rawRefreshToken);
        RefreshToken entity = refreshTokenRepository.findByToken(tokenHash)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND,
                        "Refresh token không tồn tại", HttpStatus.UNAUTHORIZED));

        if (entity.isRevoked())
            throw new AppException(ErrorCode.AUTH_REFRESH_TOKEN_REVOKED, "Refresh token đã bị thu hồi",
                    HttpStatus.UNAUTHORIZED);
        if (entity.getExpiresAt().isBefore(LocalDateTime.now()))
            throw new AppException(ErrorCode.AUTH_REFRESH_TOKEN_EXPIRED, "Refresh token đã hết hạn",
                    HttpStatus.UNAUTHORIZED);

        User user = entity.getUser();
        if (!user.isActive())
            throw new AppException(ErrorCode.AUTH_ACCOUNT_LOCKED,
                    "Tài khoản đã bị vô hiệu hoá", HttpStatus.UNAUTHORIZED);

        return jwtService.generateAccessToken(user.getUsername(), user.getRole());
    }

    @Override
    @Transactional
    public void logout(String rawRefreshToken) {
        String tokenHash = jwtService.hashToken(rawRefreshToken);
        RefreshToken entity = refreshTokenRepository.findByToken(tokenHash)
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_REFRESH_TOKEN_NOT_FOUND,
                        "Refresh token không tồn tại", HttpStatus.UNAUTHORIZED));
        entity.setRevoked(true);
        refreshTokenRepository.save(entity);
    }

    private void sendEmailUpdateOtp(User user) {
        String target = String.valueOf(user.getId());
        OtpSession existing = otpService.findFirst(OtpPurpose.EMAIL_UPDATE, target).orElse(null);
        if (existing != null
                && existing.expiresAt().isAfter(LocalDateTime.now())
                && existing.payload() instanceof EmailUpdatePayload pending
                && pending.email().equals(user.getEmail()))
            return;

        OtpSession session = otpService.issue(user, OtpPurpose.EMAIL_UPDATE, target,
                new EmailUpdatePayload(user.getId(), user.getEmail()));

        emailService.sendOtpEmail(user.getEmail(), session.otpCode(), "Mã OTP Xác Thực Email");
    }

    @Override
    @Transactional
    public void verifyEmailUpdate(EmailUpdateVerifyRequest dto) {
        User user = authRepository.findByEmail(dto.getEmail().trim())
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_OTP_SESSION_NOT_FOUND,
                        "Không tìm thấy phiên xác thực. Vui lòng đăng nhập để nhận mã OTP.",
                        HttpStatus.NOT_FOUND));

        String target = String.valueOf(user.getId());
        OtpSession session = otpService.findFirst(OtpPurpose.EMAIL_UPDATE, target).orElse(null);
        if (session == null || !(session.payload() instanceof EmailUpdatePayload pending)
                || !pending.email().equals(user.getEmail()))
            throw new AppException(ErrorCode.AUTH_OTP_SESSION_NOT_FOUND,
                    "Không tìm thấy phiên xác thực. Vui lòng đăng nhập để nhận mã OTP.",
                    HttpStatus.NOT_FOUND);

        if (user.isEmailVerified()) {
            otpService.remove(session.tempToken());
            throw new AppException(ErrorCode.AUTH_OTP_SESSION_INVALID,
                    "Email đã được xác minh trước đó. Bạn có thể đăng nhập bình thường.",
                    HttpStatus.CONFLICT);
        }

        otpService.verify(OtpPurpose.EMAIL_UPDATE, session.tempToken(), dto.getOtpCode(),
                "Vui lòng đăng nhập lại để nhận mã mới.");

        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        authRepository.save(user);
        otpService.consume(session.tempToken());
    }

    @Override
    public void resendEmailUpdateOtp(String email) {
        User user = authRepository.findByEmail(email.trim())
                .orElseThrow(() -> new AppException(ErrorCode.AUTH_OTP_SESSION_NOT_FOUND,
                        "Không tìm thấy phiên xác thực. Vui lòng đăng nhập để nhận mã OTP.",
                        HttpStatus.NOT_FOUND));

        OtpSession session = otpService.findFirst(OtpPurpose.EMAIL_UPDATE, String.valueOf(user.getId()))
                .orElse(null);
        if (session == null || !(session.payload() instanceof EmailUpdatePayload pending)
                || !pending.email().equals(user.getEmail()))
            throw new AppException(ErrorCode.AUTH_OTP_SESSION_NOT_FOUND,
                    "Không tìm thấy phiên xác thực. Vui lòng đăng nhập để nhận mã OTP.",
                    HttpStatus.NOT_FOUND);

        String otpCode = otpService.resend(OtpPurpose.EMAIL_UPDATE, session.tempToken());

        emailService.sendOtpEmail(user.getEmail(), otpCode,
                "Mã OTP Xác Thực Email (Gửi lại)");
    }

    @Override
    @Transactional
    public void revokeUserSessions(User user) {
        refreshTokenRepository.deleteByUser(user);
    }
}
