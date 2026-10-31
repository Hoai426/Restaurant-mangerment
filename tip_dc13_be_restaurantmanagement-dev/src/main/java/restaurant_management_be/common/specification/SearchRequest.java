package restaurant_management_be.common.specification;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

    private List<FilterCriteria> filters;

    private List<SortCriteria> sorts;
}
