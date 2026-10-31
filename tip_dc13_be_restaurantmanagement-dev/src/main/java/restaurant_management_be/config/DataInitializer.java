package restaurant_management_be.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.entities.User;
import restaurant_management_be.services.UserService;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(2)
public class DataInitializer implements CommandLineRunner {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Value("${admin.username:#{null}}")
    private String adminUsername;

    @Value("${admin.email:#{null}}")
    private String adminEmail;

    @Value("${admin.password:#{null}}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        try {
            initializeAdminAccount();
        } catch (Exception e) {
            log.error("Loi khoi tao du lieu", e);
            throw e;
        }
    }

    private void initializeAdminAccount() {
        User existingAdmin = userService.findByRole(User.Role.ADMIN).orElse(null);
        if (existingAdmin != null) {
            verifyAdminEmail(existingAdmin);
            log.info("Tai khoan ADMIN '{}' da ton tai. Email da xac minh: {}.",
                    existingAdmin.getUsername(), existingAdmin.isEmailVerified());
            return;
        }

        if (userService.findByUsername(adminUsername).isPresent()) {
            log.warn("Username '{}' da ton tai , khong tao admin.", adminUsername);
            return;
        }

        if (userService.findByEmail(adminEmail).isPresent()) {
            log.warn("Email '{}' da ton tai. Khong tao ADMIN.", adminEmail);
            return;
        }

        createAdminUser();
    }

    private void createAdminUser() {
        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setFullName("Administrator");
        admin.setRole(User.Role.ADMIN);
        admin.setActive(true);
        admin.setEmailVerified(true);
        admin.setEmailVerifiedAt(LocalDateTime.now());
        admin.setPhone("+1000000000");

        try {
            userService.save(admin);
            log.info("Tai khoan ADMIN '{}' tao thanh cong", adminUsername);
        } catch (Exception e) {
            log.error("Loi tao tai khoan ADMIN", e);
            throw new AppException(
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "Khong the khoi tao tai khoan ADMIN",
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void verifyAdminEmail(User admin) {
        if (admin.isEmailVerified()) {
            return;
        }

        admin.setEmailVerified(true);
        admin.setEmailVerifiedAt(LocalDateTime.now());
        userService.save(admin);
        log.info("Da xac minh email cho tai khoan ADMIN '{}'", admin.getUsername());
    }
}