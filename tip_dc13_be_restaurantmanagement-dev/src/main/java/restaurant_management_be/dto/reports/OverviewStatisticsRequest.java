package restaurant_management_be.dto.reports;

import lombok.Data;
import restaurant_management_be.common.specification.FilterCriteria;

import java.util.List;

@Data
public class OverviewStatisticsRequest {

    private List<FilterCriteria> filters;
}
