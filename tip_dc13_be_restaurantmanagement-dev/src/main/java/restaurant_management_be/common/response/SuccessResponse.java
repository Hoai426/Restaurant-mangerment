package restaurant_management_be.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.*;

@Data
@Getter
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SuccessResponse<T> {

    private int status;
    private String code;
    private String message;
    private T data;

    public static <T> SuccessResponse<T> ok(T data) {
        return new SuccessResponse<>(200, "Thành công", "Thực hiện thành công", data);
    }

    public static <T> SuccessResponse<T> ok(String message, T data) {
        return new SuccessResponse<>(200, "Thành công", message, data);
    }

    public static <T> SuccessResponse<T> created(T data) {
        return new SuccessResponse<>(201, "Đã tạo", "Tạo thành công", data);
    }

    public static <T> SuccessResponse<T> created(String message, T data) {
        return new SuccessResponse<>(201, "Đã tạo", message, data);
    }
}
