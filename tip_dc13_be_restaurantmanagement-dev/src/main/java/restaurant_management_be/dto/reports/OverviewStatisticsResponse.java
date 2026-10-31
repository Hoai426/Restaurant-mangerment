package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class OverviewStatisticsResponse {

    private BigDecimal totalRevenue;
    private long totalOrders;
    private long totalReservations;
}
