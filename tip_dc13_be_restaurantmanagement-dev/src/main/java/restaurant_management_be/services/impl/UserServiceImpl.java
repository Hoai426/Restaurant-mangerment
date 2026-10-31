package restaurant_management_be.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.dto.users.UserCreateRequest;
import restaurant_management_be.dto.users.UserCreateResponse;
import restaurant_management_be.dto.users.UserResponse;
import restaurant_management_be.entities.User;
import restaurant_management_be.mapper.UserMapper;
import restaurant_management_be.repository.UserRepository;
import restaurant_management_be.services.UserService;
import java.time.LocalDateTime;
import java.util.Optional;
import restaurant_management_be.dto.users.UserUpdateProfileRequest;
import restaurant_management_be.dto.users.UserUpdateRequest;
import restaurant_management_be.dto.users.UserUpdateStatusRequest;
import restaurant_management_be.dto.auth.OtpVerifyRequest;
import restaurant_management_be.dto.otp.EmailChangePayload;
import restaurant_management_be.dto.otp.OtpPurpose;
import restaurant_management_be.dto.otp.OtpSession;
import restaurant_management_be.dto.otp.UserCreationPayload;
import restaurant_management_be.dto.users.UserUpdateProfileResponse;
import restaurant_management_be.services.EmailService;
import restaurant_management_be.services.AuthService;
import restaurant_management_be.services.OtpService;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final AuthService authService;
    private final OtpService otpService;

    @Override
    public UserResponse getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.AUTH_USER_NOT_FOUND,
                        "Không tìm thấy người dùng",
                        HttpStatus.NOT_FOUND));

        return userMapper.toUserDetailResponse(user);
    }

    @Override
    public UserResponse getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(
                        ErrorCode.AUTH_USER_NOT_FOUND,
                        "Không tìm thấy người dùng",
                        HttpStatus.NOT_FOUND));

        return userMapper.toUserDetailResponse(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable)
                .map(userMapper::toUserDetailResponse);
    }

    @Override
    public Optional<User> findByRole(User.Role role) {
        return userRepository.findByRole(role);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public UserCreateResponse createUser(UserCreateRequest request) {
        if (request.getRole() == User.Role.ADMIN
                && userRepository.findByRole(User.Role.ADMIN).isPresent()) {
            throw new AppException(
                    ErrorCode.USER_SINGLE_ADMIN,
                    "Hệ thống chỉ cho phép tồn tại một tài khoản quản trị viên",
                    HttpStatus.CONFLICT);
        }

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new AppException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Tên đăng nhập đã tồn tại",
                    HttpStatus.CONFLICT);
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new AppException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Email đã tồn tại",
                    HttpStatus.CONFLICT);
        }

        if (userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new AppException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Số điện thoại đã tồn tại",
                    HttpStatus.CONFLICT);
        }

        otpService.removeIf(OtpPurpose.USER_CREATION, s -> s.payload() instanceof UserCreationPayload pending
                && (pending.username().equalsIgnoreCase(request.getUsername())
                        || pending.email().equalsIgnoreCase(request.getEmail())));
        OtpSession session = otpService.issue(OtpPurpose.USER_CREATION, request.getEmail(),
                new UserCreationPayload(request.getUsername(), request.getFullName(), request.getEmail(),
                        request.getPhone(), request.getRole(), request.getIsActive(),
                        passwordEncoder.encode(request.getPassword())));

        emailService.sendOtpEmail(request.getEmail(), session.otpCode(), "Mã OTP Kích Hoạt Tài Khoản");

        return new UserCreateResponse(session.tempToken());
    }

    @Override
    public UserUpdateProfileResponse updateMyProfile(String username, UserUpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(
                        ErrorCode.AUTH_USER_NOT_FOUND,
                        "Không tìm thấy người dùng",
                        HttpStatus.NOT_FOUND));

        boolean hasEmailChange = request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().trim().equalsIgnoreCase(user.getEmail());
        if (!hasEmailChange) {
            applyCommonUpdates(user, request.getEmail(), request.getPhone(), request.getFullName(),
                    request.getPassword(), request.getCurrentPassword(), true);
            User savedUser = userRepository.save(user);
            return new UserUpdateProfileResponse(userMapper.toUserDetailResponse(savedUser), null);
        }

        String newEmail = request.getEmail().trim();
        if (userRepository.findByEmail(newEmail).isPresent()) {
            throw new AppException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Email đã tồn tại",
                    HttpStatus.CONFLICT);
        }
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            String newPhone = request.getPhone().trim();
            if (!newPhone.equals(user.getPhone())
                    && userRepository.findByPhone(newPhone).isPresent()) {
                throw new AppException(
                        ErrorCode.RESOURCE_ALREADY_EXISTS,
                        "Số điện thoại đã tồn tại",
                        HttpStatus.CONFLICT);
            }
        }
        String encodedPassword = null;
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()
                    || !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new AppException(
                        ErrorCode.USER_CURRENT_PASSWORD_INCORRECT,
                        "Mật khẩu hiện tại không đúng",
                        HttpStatus.FORBIDDEN);
            }
            encodedPassword = passwordEncoder.encode(request.getPassword());
        }

        otpService.removeIf(OtpPurpose.EMAIL_CHANGE, s -> s.payload() instanceof EmailChangePayload pending
                && pending.userId().equals(user.getId()));
        OtpSession session = otpService.issue(user, OtpPurpose.EMAIL_CHANGE, String.valueOf(user.getId()),
                new EmailChangePayload(
                user.getId(),
                (request.getFullName() != null && !request.getFullName().isBlank())
                        ? request.getFullName().trim()
                        : null,
                (request.getPhone() != null && !request.getPhone().isBlank())
                        ? request.getPhone().trim()
                        : null,
                newEmail,
                encodedPassword));

        emailService.sendOtpEmail(newEmail, session.otpCode(), "Mã OTP Xác Nhận Thay Đổi Email");

        return new UserUpdateProfileResponse(userMapper.toUserDetailResponse(user), session.tempToken());
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long userId, UserUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.USER_NOT_FOUND,
                        "Không tìm thấy người dùng",
                        HttpStatus.NOT_FOUND));

        if (user.getRole() == User.Role.ADMIN) {
            boolean losingAdmin = (request.getRole() != null && request.getRole() != User.Role.ADMIN)
                    || (request.getIsActive() != null && !request.getIsActive());
            if (losingAdmin) {
                throw new AppException(
                        ErrorCode.USER_SINGLE_ADMIN,
                        "Không thể thay đổi vai trò hoặc vô hiệu hóa tài khoản quản trị viên duy nhất",
                        HttpStatus.CONFLICT);
            }
        }

        applyCommonUpdates(user, null, request.getPhone(), request.getFullName(),
                request.getPassword(), null, false);

        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getIsActive() != null) {
            user.setActive(request.getIsActive());
        }

        User savedUser = userRepository.save(user);

        if (Boolean.FALSE.equals(request.getIsActive())
                || (request.getPassword() != null && !request.getPassword().isBlank())) {
            authService.revokeUserSessions(savedUser);
        }

        return userMapper.toUserDetailResponse(savedUser);
    }

    private void applyCommonUpdates(User user, String email, String phone, String fullName,
            String password, String currentPassword, boolean requireCurrentPassword) {
        if (fullName != null && !fullName.isBlank()) {
            user.setFullName(fullName.trim());
        }

        if (email != null && !email.isBlank()) {
            String newEmail = email.trim();
            if (!newEmail.equalsIgnoreCase(user.getEmail())
                    && userRepository.findByEmail(newEmail).isPresent()) {
                throw new AppException(
                        ErrorCode.RESOURCE_ALREADY_EXISTS,
                        "Email đã tồn tại",
                        HttpStatus.CONFLICT);
            }
            user.setEmail(newEmail);
        }

        if (phone != null && !phone.isBlank()) {
            String newPhone = phone.trim();
            if (!newPhone.equals(user.getPhone())
                    && userRepository.findByPhone(newPhone).isPresent()) {
                throw new AppException(
                        ErrorCode.RESOURCE_ALREADY_EXISTS,
                        "Số điện thoại đã tồn tại",
                        HttpStatus.CONFLICT);
            }
            user.setPhone(newPhone);
        }

        if (password != null && !password.isBlank()) {
            if (requireCurrentPassword) {
                if (currentPassword == null || currentPassword.isBlank()
                        || !passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
                    throw new AppException(
                            ErrorCode.USER_CURRENT_PASSWORD_INCORRECT,
                            "Mật khẩu hiện tại không đúng",
                            HttpStatus.FORBIDDEN);
                }
            }
            user.setPasswordHash(passwordEncoder.encode(password));
        }
    }

    @Override
    @Transactional
    public UserResponse verifyEmailChange(String username, OtpVerifyRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(
                        ErrorCode.AUTH_USER_NOT_FOUND,
                        "Không tìm thấy người dùng",
                        HttpStatus.NOT_FOUND));

        OtpSession session = otpService.get(request.getTempToken()).orElse(null);
        if (session == null || !(session.payload() instanceof EmailChangePayload owned)
                || !owned.userId().equals(user.getId()))
            throw new AppException(
                    ErrorCode.AUTH_OTP_SESSION_INVALID,
                    "Phiên xác thực không hợp lệ hoặc không tồn tại",
                    HttpStatus.BAD_REQUEST);

        EmailChangePayload pending = (EmailChangePayload) otpService.verify(OtpPurpose.EMAIL_CHANGE,
                request.getTempToken(), request.getOtpCode(), "Vui lòng thực hiện lại.");
        if (userRepository.findByEmail(pending.newEmail()).isPresent())
            throw new AppException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Email đã tồn tại",
                    HttpStatus.CONFLICT);

        if (pending.fullName() != null) {
            user.setFullName(pending.fullName());
        }
        if (pending.phone() != null) {
            if (!pending.phone().equals(user.getPhone())
                    && userRepository.findByPhone(pending.phone()).isPresent()) {
                throw new AppException(
                        ErrorCode.RESOURCE_ALREADY_EXISTS,
                        "Số điện thoại đã tồn tại",
                        HttpStatus.CONFLICT);
            }
            user.setPhone(pending.phone());
        }
        if (pending.encodedPassword() != null) {
            user.setPasswordHash(pending.encodedPassword());
        }
        user.setEmail(pending.newEmail());
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());

        otpService.consume(request.getTempToken());
        User savedUser = userRepository.save(user);
        return userMapper.toUserDetailResponse(savedUser);
    }

    @Override
    public UserResponse resendEmailChangeOtp(String username, String tempToken) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(
                        ErrorCode.AUTH_USER_NOT_FOUND,
                        "Không tìm thấy người dùng",
                        HttpStatus.NOT_FOUND));

        OtpSession session = otpService.get(tempToken).orElse(null);
        if (session == null || !(session.payload() instanceof EmailChangePayload pending)
                || !pending.userId().equals(user.getId()))
            throw new AppException(
                    ErrorCode.AUTH_OTP_SESSION_NOT_FOUND,
                    "Không tìm thấy phiên xác thực. Vui lòng thực hiện lại.",
                    HttpStatus.NOT_FOUND);

        String otpCode = otpService.resend(OtpPurpose.EMAIL_CHANGE, tempToken);

        emailService.sendOtpEmail(pending.newEmail(), otpCode,
                "Mã OTP Xác Nhận Thay Đổi Email (Gửi lại)");
        return userMapper.toUserDetailResponse(user);
    }

    @Override
    @Transactional
    public UserResponse verifyUserCreation(OtpVerifyRequest request) {
        otpService.get(request.getTempToken())
                .orElseThrow(() -> new AppException(
                        ErrorCode.AUTH_OTP_SESSION_INVALID,
                        "Phiên kích hoạt không hợp lệ hoặc không tồn tại",
                        HttpStatus.BAD_REQUEST));

        UserCreationPayload createRequest = (UserCreationPayload) otpService.verify(OtpPurpose.USER_CREATION,
                request.getTempToken(), request.getOtpCode(), "Vui lòng tạo lại tài khoản.");
        if (userRepository.findByUsername(createRequest.username()).isPresent())
            throw new AppException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Tên đăng nhập đã tồn tại",
                    HttpStatus.CONFLICT);
        if (userRepository.findByEmail(createRequest.email()).isPresent())
            throw new AppException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Email đã tồn tại",
                    HttpStatus.CONFLICT);
        if (userRepository.findByPhone(createRequest.phone()).isPresent())
            throw new AppException(
                    ErrorCode.RESOURCE_ALREADY_EXISTS,
                    "Số điện thoại đã tồn tại",
                    HttpStatus.CONFLICT);

        User user = new User();
        user.setUsername(createRequest.username());
        user.setFullName(createRequest.fullName());
        user.setEmail(createRequest.email());
        user.setPhone(createRequest.phone());
        user.setRole(createRequest.role());
        user.setActive(createRequest.isActive());
        user.setPasswordHash(createRequest.encodedPassword());
        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        otpService.consume(request.getTempToken());
        return userMapper.toUserDetailResponse(savedUser);
    }

    @Override
    public UserCreateResponse resendUserCreationOtp(String tempToken) {
        OtpSession session = otpService.get(tempToken).orElse(null);
        if (session == null || !(session.payload() instanceof UserCreationPayload pending))
            throw new AppException(
                    ErrorCode.AUTH_OTP_SESSION_NOT_FOUND,
                    "Không tìm thấy phiên kích hoạt. Vui lòng tạo lại tài khoản.",
                    HttpStatus.NOT_FOUND);

        String otpCode = otpService.resend(OtpPurpose.USER_CREATION, tempToken);

        emailService.sendOtpEmail(pending.email(), otpCode,
                "Mã OTP Kích Hoạt Tài Khoản (Gửi lại)");
        return new UserCreateResponse(tempToken);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(String currentUsername, Long userId, UserUpdateStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(
                        ErrorCode.USER_NOT_FOUND,
                        "Không tìm thấy người dùng",
                        HttpStatus.NOT_FOUND));

        boolean newStatus = request.getIsActive();

        if (!newStatus && user.getUsername().equals(currentUsername)) {
            throw new AppException(
                    ErrorCode.USER_CANNOT_DEACTIVATE_SELF,
                    "Không thể vô hiệu hóa tài khoản của chính bạn",
                    HttpStatus.BAD_REQUEST);
        }

        if (!newStatus && user.getRole() == User.Role.ADMIN
                && userRepository.countByRoleAndActiveTrue(User.Role.ADMIN) <= 1) {
            throw new AppException(
                    ErrorCode.USER_SINGLE_ADMIN,
                    "Không thể vô hiệu hóa tài khoản quản trị viên duy nhất",
                    HttpStatus.CONFLICT);
        }
        if (user.isActive() != newStatus) {
            user.setActive(newStatus);
            User savedUser = userRepository.save(user);

            if (!newStatus) {
                authService.revokeUserSessions(savedUser);
            }

            return userMapper.toUserDetailResponse(savedUser);
        }

        return userMapper.toUserDetailResponse(user);
    }

}