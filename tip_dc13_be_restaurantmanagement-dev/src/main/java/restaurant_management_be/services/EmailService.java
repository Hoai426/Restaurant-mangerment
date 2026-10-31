package restaurant_management_be.services;

public interface EmailService {

    void sendOtpEmail(String toEmail, String otpCode);

    void sendOtpEmail(String toEmail, String otpCode, String subject);
}