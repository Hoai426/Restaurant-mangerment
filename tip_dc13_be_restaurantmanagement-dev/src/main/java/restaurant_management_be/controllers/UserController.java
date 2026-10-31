package restaurant_management_be.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.dto.users.*;
import restaurant_management_be.services.UserService;
import restaurant_management_be.dto.auth.OtpVerifyRequest;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<Page<UserResponse>>> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(SuccessResponse.ok("Lấy danh sách người dùng thành công", users));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<UserResponse>> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        UserResponse userResponse = userService.getMyProfile(username);
        return ResponseEntity.ok(SuccessResponse.ok("Lấy thông tin cá nhân thành công", userResponse));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<UserResponse>> getUserDetails(@PathVariable Long id) {
        UserResponse userResponse = userService.getUserDetails(id);
        return ResponseEntity.ok(SuccessResponse.ok("Lấy thông tin người dùng thành công", userResponse));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<UserCreateResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        UserCreateResponse result = userService.createUser(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SuccessResponse.created(
                        "Đã gửi OTP kích hoạt đến email. Tài khoản sẽ được tạo sau khi xác thực",
                        result));
    }

    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<UserUpdateProfileResponse>> updateMyProfile(
            Authentication authentication,
            @Valid @RequestBody UserUpdateProfileRequest request) {
        UserUpdateProfileResponse result = userService.updateMyProfile(authentication.getName(), request);
        String message = result.getEmailChangeTempToken() != null
                ? "Cập nhật thành công. Vui lòng nhập OTP gửi đến email mới để hoàn tất thay đổi"
                : "Cập nhật thông tin cá nhân thành công";
        return ResponseEntity.ok(SuccessResponse.ok(message, result));
    }

    @PostMapping("/me/email/verify")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<UserResponse>> verifyEmailChange(
            Authentication authentication,
            @Valid @RequestBody OtpVerifyRequest request) {
        UserResponse userResponse = userService.verifyEmailChange(authentication.getName(), request);
        return ResponseEntity.ok(SuccessResponse.ok(
                "Xác thực email thành công. Toàn bộ thay đổi đã được lưu", userResponse));
    }

    @PostMapping("/me/email/resend")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SuccessResponse<UserResponse>> resendEmailChangeOtp(
            Authentication authentication,
            @Valid @RequestBody EmailChangeResendRequest request) {
        UserResponse userResponse = userService.resendEmailChangeOtp(
                authentication.getName(), request.getTempToken());
        return ResponseEntity.ok(SuccessResponse.ok(
                "OTP mới đã được gửi đến email mới", userResponse));
    }

    @PostMapping("/create/verify")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<UserResponse>> verifyUserCreation(
            @Valid @RequestBody OtpVerifyRequest request) {
        UserResponse userResponse = userService.verifyUserCreation(request);
        return ResponseEntity.ok(SuccessResponse.ok(
                "Xác thực OTP thành công. Tài khoản đã được kích hoạt", userResponse));
    }

    @PostMapping("/create/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<UserCreateResponse>> resendUserCreationOtp(
            @Valid @RequestBody EmailChangeResendRequest request) {
        UserCreateResponse result = userService.resendUserCreationOtp(request.getTempToken());
        return ResponseEntity.ok(SuccessResponse.ok(
                "OTP mới đã được gửi đến email đăng ký", result));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        UserResponse userResponse = userService.updateUser(id, request);
        return ResponseEntity.ok(SuccessResponse.ok(
                "Cập nhật thông tin người dùng thành công",
                userResponse));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody UserUpdateStatusRequest request) {
        UserResponse userResponse = userService.updateUserStatus(
                authentication.getName(), id, request);
        String message = Boolean.TRUE.equals(request.getIsActive())
                ? "Kích hoạt người dùng thành công"
                : "Vô hiệu hóa người dùng thành công";
        return ResponseEntity.ok(SuccessResponse.ok(message, userResponse));
    }

}
