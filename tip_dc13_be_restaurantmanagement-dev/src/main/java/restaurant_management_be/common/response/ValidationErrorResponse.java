package restaurant_management_be.common.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

public class ValidationErrorResponse extends ErrorResponse {

    @Getter
    private List<FieldError> details;

    public ValidationErrorResponse(List<FieldError> details) {
        super(400, "Yêu cầu không hợp lệ", "VALIDATION_FAILED", "Dữ liệu đầu vào không hợp lệ");
        this.details = details;
    }

    @Getter
    @AllArgsConstructor
    public static class FieldError {
        private String field;
        private String message;
    }
}
