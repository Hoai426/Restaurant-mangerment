package restaurant_management_be.dto.reports;

import lombok.Data;

import restaurant_management_be.common.report.ReportTarget;
import restaurant_management_be.common.specification.FilterCriteria;

import java.util.List;

@Data
public class ReportQueryRequest {

    private ReportTarget target;

    private String preset;

    private String startDate;

    private String endDate;

    private String groupBy;

    private String timeField;

    private List<String> groupFields;

    private List<ReportMetricRequest> metrics;

    private List<FilterCriteria> filters;

    private Integer topN;
}
