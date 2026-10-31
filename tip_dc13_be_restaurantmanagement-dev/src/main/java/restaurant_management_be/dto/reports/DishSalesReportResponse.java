package restaurant_management_be.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class DishSalesReportResponse {

    private List<Item> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private String sortBy;
    private String direction;

    @Data
    @AllArgsConstructor
    public static class Item {
        private Long dishId;
        private String dishName;
        private long quantitySold;
        private BigDecimal revenue;
    }
}
