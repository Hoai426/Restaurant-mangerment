package restaurant_management_be.common.report;

import java.util.List;

import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.dto.reports.ReportMetricRequest;

public record ReportQueryPlan(
        ReportTarget target,
        ReportRange range,
        String timeField,
        List<String> groupFields,
        List<ReportMetricRequest> metrics,
        List<FilterCriteria> filters,
        Integer topN) {
}
