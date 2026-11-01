package restaurant_management_be.services.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import restaurant_management_be.services.EmailService;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;

    @Value("${app.mail.from:}")
    private String fromEmailOverride;

    @Value("${spring.mail.username}")
    private String mailUsername;

    /** false = che do demo, khong gui mail that. */
    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    private String resolveFrom() {
        return (fromEmailOverride == null || fromEmailOverride.isBlank())
                ? mailUsername
                : fromEmailOverride;
    }

    @Override
    public void sendOtpEmail(String toEmail, String otpCode) {
        sendOtpEmail(toEmail, otpCode, "Mã OTP xác thực");
    }

    @Override
    public void sendOtpEmail(String toEmail, String otpCode, String subject) {
        if (!mailEnabled) {
            log.info("[DEMO] Bo qua gui email OTP toi {} - ma OTP: {}", toEmail, otpCode);
            return;
        }

        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(resolveFrom());
        msg.setTo(toEmail);
        msg.setSubject("[Restaurant] " + subject);
        msg.setText("Mã OTP của bạn là: " + otpCode
                + "\n\nMã có hiệu lực trong 5 phút."
                + "\nKhông chia sẻ mã này với bất kỳ ai.");
        mailSender.send(msg);
    }
}
