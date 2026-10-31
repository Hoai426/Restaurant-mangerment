package restaurant_management_be.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import lombok.Getter;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy HH:mm:ss");

    private String timestamp;
    private int status;
    private String code;
    private String errorCode;
    private String message;

    public ErrorResponse(int status, String code, String errorCode, String message) {
        this.timestamp = LocalDateTime.now().format(FORMATTER);
        this.status = status;
        this.code = code;
        this.errorCode = errorCode;
        this.message = message;
    }
}
