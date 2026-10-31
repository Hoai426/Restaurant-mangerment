package restaurant_management_be.common.report;

import org.springframework.http.HttpStatus;

import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;

public enum ReportGroupBy {

    HOUR("%Y-%m-%d %H:00"),
    DAY("%Y-%m-%d"),
    WEEK("%X-W%V"),
    MONTH("%Y-%m");

    private final String dateFormat;

    ReportGroupBy(String dateFormat) {
        this.dateFormat = dateFormat;
    }

    public String dateFormat() {
        return dateFormat;
    }

    public static ReportGroupBy from(String value) {
        if (value == null || value.isBlank()) {
            return DAY;
        }
        try {
            return valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Giá trị groupBy không hợp lệ",
                    HttpStatus.BAD_REQUEST);
        }
    }
}
