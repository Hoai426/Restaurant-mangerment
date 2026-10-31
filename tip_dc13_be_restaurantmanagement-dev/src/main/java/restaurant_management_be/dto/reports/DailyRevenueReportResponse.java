package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class DailyRevenueReportResponse {

    private Summary summary;
    private List<DailyPoint> points;

    @Data
    @AllArgsConstructor
    public static class Summary {
        private BigDecimal totalRevenue;
        private long totalOrders;
        private String startDate;
        private String endDate;
    }

    @Data
    @AllArgsConstructor
    public static class DailyPoint {
        private String date;
        private BigDecimal revenue;
        private long orderCount;
    }
}
