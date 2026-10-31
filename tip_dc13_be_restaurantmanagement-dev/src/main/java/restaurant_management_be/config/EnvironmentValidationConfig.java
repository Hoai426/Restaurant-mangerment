package restaurant_management_be.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.util.StringUtil;

@Component
@Order(1)
public class EnvironmentValidationConfig implements ApplicationRunner {

    private static final String[] REQUIRED_PROPERTIES = {
            "DB_URL",
            "DB_USERNAME",
            "DB_PASSWORD",
            "JWT_SECRET",
            "MAIL_USERNAME",
            "MAIL_PASSWORD",
            "ADMIN_USERNAME",
            "ADMIN_EMAIL",
            "ADMIN_PASSWORD"
    };

    private final Environment environment;

    public EnvironmentValidationConfig(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        for (String property : REQUIRED_PROPERTIES) {
            if (StringUtil.isBlank(environment.getProperty(property))) {
                throw new AppException(
                        ErrorCode.ENV_VALIDATION_FAILED,
                        property + " chưa được cấu hình trong .env",
                        HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
}