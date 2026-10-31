package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class TopSellingDishesResponse {

    private String startDate;
    private String endDate;
    private List<Item> items;

    @Data
    @AllArgsConstructor
    public static class Item {
        private int rank;
        private Long dishId;
        private String dishName;
        private long quantitySold;
        private BigDecimal revenue;
    }
}
