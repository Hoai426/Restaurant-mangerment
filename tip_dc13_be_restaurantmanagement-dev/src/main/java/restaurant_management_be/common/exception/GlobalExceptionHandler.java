package restaurant_management_be.common.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import restaurant_management_be.common.response.ErrorResponse;
import restaurant_management_be.common.response.ValidationErrorResponse;

import java.util.List;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(AppException.class)
        public ResponseEntity<ErrorResponse> handleAppException(AppException ex) {
                HttpStatus status = ex.getHttpStatus();
                ErrorResponse body = new ErrorResponse(
                                status.value(),
                                status.getReasonPhrase(),
                                ex.getErrorCode(),
                                ex.getMessage());
                return ResponseEntity.status(status).body(body);
        }

        @ExceptionHandler(AuthorizationDeniedException.class)
        public ResponseEntity<ErrorResponse> handleAuthorizationDenied(AuthorizationDeniedException ex) {
                ErrorResponse body = new ErrorResponse(
                                403,
                                "Từ chối truy cập",
                                "ACCESS_DENIED",
                                "Bạn không có quyền truy cập tài nguyên này");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
        }

        @ExceptionHandler(BindException.class)
        public ResponseEntity<ValidationErrorResponse> handleValidation(
                        BindException ex) {

                List<ValidationErrorResponse.FieldError> details = ex.getBindingResult()
                                .getFieldErrors()
                                .stream()
                                .map(fe -> new ValidationErrorResponse.FieldError(
                                                fe.getField(),
                                                fe.getDefaultMessage()))
                                .collect(Collectors.toList());

                return ResponseEntity.badRequest().body(new ValidationErrorResponse(details));
        }

        @ExceptionHandler(HttpMessageNotReadableException.class)
        public ResponseEntity<ErrorResponse> handleMessageNotReadable(HttpMessageNotReadableException ex) {
                ErrorResponse body = new ErrorResponse(
                                400,
                                "Yêu cầu không hợp lệ",
                                ErrorCode.VALIDATION_FAILED,
                                "Dữ liệu đầu vào không hợp lệ hoặc sai định dạng");
                return ResponseEntity.badRequest().body(body);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGeneral(Exception ex) {
                ex.printStackTrace();

                ErrorResponse body = new ErrorResponse(
                                500,
                                "Lỗi máy chủ nội bộ",
                                ErrorCode.INTERNAL_SERVER_ERROR,
                                "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
        }
}
