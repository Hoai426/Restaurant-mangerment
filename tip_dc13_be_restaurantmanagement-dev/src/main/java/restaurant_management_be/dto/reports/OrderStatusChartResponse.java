package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderStatusChartResponse {

    private Summary summary;
    private List<StatusStatistics> byStatus;

    @Data
    @AllArgsConstructor
    public static class Summary {
        private long totalOrders;
        private BigDecimal totalValue;
        private String startDate;
        private String endDate;
    }

    @Data
    @AllArgsConstructor
    public static class StatusStatistics {
        private String status;
        private long orderCount;
        private BigDecimal totalValue;
    }
}
