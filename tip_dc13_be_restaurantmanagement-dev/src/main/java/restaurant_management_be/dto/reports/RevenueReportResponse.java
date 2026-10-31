package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class RevenueReportResponse {

    private Summary summary;
    private List<TimelinePoint> timeline;

    @Data
    @AllArgsConstructor
    public static class Summary {
        private BigDecimal totalRevenue;
        private Long totalOrders;
        private BigDecimal averageOrderValue;
        private BigDecimal cashAmount;
        private BigDecimal cardAmount;
        private BigDecimal qrAmount;
    }

    @Data
    @AllArgsConstructor
    public static class TimelinePoint {
        private String period;
        private BigDecimal revenue;
        private Long orderCount;
        private BigDecimal cashAmount;
        private BigDecimal cardAmount;
        private BigDecimal qrAmount;
    }
}
