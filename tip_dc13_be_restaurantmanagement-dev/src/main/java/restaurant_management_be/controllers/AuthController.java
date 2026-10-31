package restaurant_management_be.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.dto.auth.*;
import restaurant_management_be.services.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<SuccessResponse<OtpChallengeResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        OtpChallengeResponse result = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("OTP đã được gửi đến email đăng ký", result));
    }

    @PostMapping("/verify-registration-otp")
    public ResponseEntity<SuccessResponse<Void>> verifyRegistrationOtp(
            @Valid @RequestBody OtpVerifyRequest request) {
        authService.verifyRegistrationOtp(request);
        return ResponseEntity.ok(SuccessResponse.ok("Xác minh tài khoản thành công. Bạn có thể đăng nhập.", null));
    }

    @PostMapping("/resend-registration-otp")
    public ResponseEntity<SuccessResponse<OtpChallengeResponse>> resendRegistrationOtp(
            @Valid @RequestBody ResendOtpRequest request) {
        OtpChallengeResponse result = authService.resendRegistrationOtp(request.getEmail());
        return ResponseEntity.ok(SuccessResponse.ok("OTP mới đã được gửi đến email", result));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<SuccessResponse<OtpChallengeResponse>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        OtpChallengeResponse result = authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(SuccessResponse.ok("OTP khôi phục mật khẩu đã được gửi đến email", result));
    }

    @PostMapping("/verify-forgot-password-otp")
    public ResponseEntity<SuccessResponse<ResetChallengeResponse>> verifyForgotPasswordOtp(
            @Valid @RequestBody OtpVerifyRequest request) {
        ResetChallengeResponse result = authService.verifyForgotPasswordOtp(request);
        return ResponseEntity.ok(SuccessResponse.ok("Xác minh OTP thành công. Vui lòng nhập mật khẩu mới.", result));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<SuccessResponse<Void>> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity
                .ok(SuccessResponse.ok("Đặt lại mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.", null));
    }

    @PostMapping("/verify-email-update")
    public ResponseEntity<SuccessResponse<Void>> verifyEmailUpdate(
            @Valid @RequestBody EmailUpdateVerifyRequest request) {
        authService.verifyEmailUpdate(request);
        return ResponseEntity.ok(SuccessResponse.ok(
                "Xác thực email thành công. Bạn có thể đăng nhập.", null));
    }

    @PostMapping("/resend-email-update-otp")
    public ResponseEntity<SuccessResponse<Void>> resendEmailUpdateOtp(
            @Valid @RequestBody ResendOtpRequest request) {
        authService.resendEmailUpdateOtp(request.getEmail());
        return ResponseEntity.ok(SuccessResponse.ok(
                "OTP mới đã được gửi đến email", null));
    }

    @PostMapping("/login")
    public ResponseEntity<SuccessResponse<LoginResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        LoginResponse result = authService.login(request);
        return ResponseEntity.ok(SuccessResponse.ok("Đăng nhập thành công", result));
    }

    @PostMapping("/refresh")
    public ResponseEntity<SuccessResponse<RefreshResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request) {
        String newAccessToken = authService.refreshAccessToken(request.getRefreshToken());
        return ResponseEntity
                .ok(SuccessResponse.ok("Token được làm mới thành công", new RefreshResponse(newAccessToken)));
    }

    @PostMapping("/logout")
    public ResponseEntity<SuccessResponse<Void>> logout(
            @Valid @RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok(SuccessResponse.ok("Đăng xuất thành công", null));
    }
}