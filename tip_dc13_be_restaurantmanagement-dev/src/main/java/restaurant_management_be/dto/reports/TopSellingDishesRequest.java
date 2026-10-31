package restaurant_management_be.dto.reports;

import lombok.Data;

@Data
public class TopSellingDishesRequest {

    private Integer limit = 5;
    private String preset;
    private String startDate;
    private String endDate;
}
