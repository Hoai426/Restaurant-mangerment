package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class PaymentStatisticsResponse {

    private Summary summary;
    private List<MethodStatistics> byMethod;
    private List<StatusStatistics> byStatus;

    @Data
    @AllArgsConstructor
    public static class Summary {
        private long totalPayments;
        private BigDecimal totalAmount;
    }

    @Data
    @AllArgsConstructor
    public static class MethodStatistics {
        private String method;
        private long paymentCount;
        private BigDecimal totalAmount;
    }

    @Data
    @AllArgsConstructor
    public static class StatusStatistics {
        private String status;
        private long paymentCount;
        private BigDecimal totalAmount;
    }
}
