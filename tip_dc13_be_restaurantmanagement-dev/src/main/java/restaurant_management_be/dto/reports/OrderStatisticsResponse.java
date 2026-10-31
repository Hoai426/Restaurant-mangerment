package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class OrderStatisticsResponse {

    private Summary summary;
    private List<StatusStatistics> byStatus;
    private List<ValueRangeStatistics> byValueRange;

    @Data
    @AllArgsConstructor
    public static class Summary {
        private long totalOrders;
        private BigDecimal totalValue;
    }

    @Data
    @AllArgsConstructor
    public static class StatusStatistics {
        private String status;
        private long orderCount;
        private BigDecimal totalValue;
    }

    @Data
    @AllArgsConstructor
    public static class ValueRangeStatistics {
        private String range;
        private BigDecimal minAmount;
        private BigDecimal maxAmountExclusive;
        private long orderCount;
        private BigDecimal totalValue;
    }
}
