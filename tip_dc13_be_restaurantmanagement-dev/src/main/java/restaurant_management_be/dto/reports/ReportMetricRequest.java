package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import restaurant_management_be.common.report.ReportMetric;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportMetricRequest {
    private ReportMetric op;
    private String field;
    private String alias;
}
