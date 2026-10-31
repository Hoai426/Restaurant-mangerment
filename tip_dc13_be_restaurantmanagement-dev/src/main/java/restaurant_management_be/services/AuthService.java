package restaurant_management_be.services;

import restaurant_management_be.dto.auth.*;
import restaurant_management_be.entities.User;

public interface AuthService {

    OtpChallengeResponse register(RegisterRequest dto);

    void verifyRegistrationOtp(OtpVerifyRequest dto);

    OtpChallengeResponse resendRegistrationOtp(String email);

    OtpChallengeResponse forgotPassword(String email);

    ResetChallengeResponse verifyForgotPasswordOtp(OtpVerifyRequest dto);

    void resetPassword(ResetPasswordRequest dto);

    void verifyEmailUpdate(EmailUpdateVerifyRequest dto);

    void resendEmailUpdateOtp(String email);

    LoginResponse login(LoginRequest dto);

    String refreshAccessToken(String rawRefreshToken);

    void logout(String rawRefreshToken);

    void revokeUserSessions(User user);
}
