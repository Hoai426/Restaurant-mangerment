package restaurant_management_be.services;
import restaurant_management_be.dto.dishes.DishResponse;
import restaurant_management_be.common.specification.SearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import restaurant_management_be.dto.dishes.DishCreateRequest;
import restaurant_management_be.dto.dishes.DishUpdateRequest;
import restaurant_management_be.dto.dishes.DishUpdateStatusRequest;
import restaurant_management_be.entities.Dish;
import java.util.List;

public interface DishService {
    List<DishResponse> getAllDishes();
    DishResponse getDishById(Long id);
    Page<DishResponse> searchDishes(SearchRequest request, Pageable pageable);
    DishResponse createDish(DishCreateRequest request);
    DishResponse updateDish(Long id, DishUpdateRequest request);
    DishResponse updateDishStatus(Long id, DishUpdateStatusRequest request);
    List<Dish> getDishesByIds(List<Long> ids);
}
