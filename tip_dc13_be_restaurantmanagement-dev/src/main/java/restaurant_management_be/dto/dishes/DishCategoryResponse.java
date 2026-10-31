package restaurant_management_be.dto.dishes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DishCategoryResponse {
    private Long id;
    private String name;
}