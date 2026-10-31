package restaurant_management_be.common.report;

import org.springframework.http.HttpStatus;

import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.util.StringUtil;

import java.time.LocalDate;

public final class ReportRangeResolver {

    private ReportRangeResolver() {
    }

    public static ReportRange resolve(String preset, String startDate, String endDate, String groupBy) {
        ReportGroupBy group = ReportGroupBy.from(groupBy);

        boolean hasPreset = !StringUtil.isBlank(preset);
        boolean hasCustom = !StringUtil.isBlank(startDate) || !StringUtil.isBlank(endDate);

        if (hasPreset && hasCustom) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Không được dùng preset đồng thời với startDate/endDate",
                    HttpStatus.BAD_REQUEST);
        }

        if (hasPreset) {
            return resolvePreset(preset, group);
        }

        if (!hasCustom) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Vui lòng cung cấp startDate và endDate hoặc preset",
                    HttpStatus.BAD_REQUEST);
        }

        if (StringUtil.isBlank(startDate) || StringUtil.isBlank(endDate)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Cần đầy đủ cả startDate và endDate",
                    HttpStatus.BAD_REQUEST);
        }
        LocalDate start = parseDate(startDate, "Ngày bắt đầu");
        LocalDate end = parseDate(endDate, "Ngày kết thúc");
        if (start.isAfter(end)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Ngày bắt đầu không được sau ngày kết thúc", HttpStatus.BAD_REQUEST);
        }
        return new ReportRange(start.atStartOfDay(), end.plusDays(1).atStartOfDay(), group);
    }

    private static ReportRange resolvePreset(String preset, ReportGroupBy group) {
        LocalDate today = LocalDate.now();
        LocalDate start;
        LocalDate endExclusive;

        switch (preset.trim().toUpperCase()) {
            case "TODAY" -> {
                start = today;
                endExclusive = today.plusDays(1);
            }
            case "YESTERDAY" -> {
                start = today.minusDays(1);
                endExclusive = today;
            }
            case "LAST_7_DAYS" -> {
                start = today.minusDays(6);
                endExclusive = today.plusDays(1);
            }
            case "THIS_MONTH" -> {
                start = today.withDayOfMonth(1);
                endExclusive = today.withDayOfMonth(1).plusMonths(1);
            }
            default -> throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Preset thời gian không hợp lệ: " + preset, HttpStatus.BAD_REQUEST);
        }

        return new ReportRange(start.atStartOfDay(), endExclusive.atStartOfDay(), group);
    }

    private static LocalDate parseDate(String value, String label) {
        if (StringUtil.isBlank(value)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    label + " không được để trống", HttpStatus.BAD_REQUEST);
        }
        try {
            return LocalDate.parse(value.trim());
        } catch (RuntimeException e) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    label + " phải đúng định dạng yyyy-MM-dd", HttpStatus.BAD_REQUEST);
        }
    }
}
