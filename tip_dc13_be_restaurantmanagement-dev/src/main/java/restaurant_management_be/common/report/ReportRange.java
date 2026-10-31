package restaurant_management_be.common.report;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReportRange {

    private final LocalDateTime start;
    private final LocalDateTime end;
    private final ReportGroupBy groupBy;
}
