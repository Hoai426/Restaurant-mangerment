package restaurant_management_be.dto.reports;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class DishSalesReportRequest {

    @Pattern(regexp = "(?i)^(QUANTITY_SOLD|REVENUE|DISH_NAME)$")
    private String sortBy = "REVENUE";

    @Pattern(regexp = "(?i)^(ASC|DESC)$")
    private String direction = "DESC";

    @NotNull
    @Min(0)
    private Integer page = 0;

    @NotNull
    @Min(1)
    @Max(100)
    private Integer size = 20;
}
