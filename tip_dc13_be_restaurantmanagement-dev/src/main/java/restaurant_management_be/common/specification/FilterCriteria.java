package restaurant_management_be.common.specification;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterCriteria {

    private String field;
    private Object value;
    private FilterOperation operation;
}