package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.dishes.DishCategoryResponse;
import restaurant_management_be.dto.dishes.DishCreateRequest;
import restaurant_management_be.dto.dishes.DishResponse;
import restaurant_management_be.entities.Category;
import restaurant_management_be.entities.Dish;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface DishMapper {

    DishResponse toResponse(Dish entity);

    DishCategoryResponse toCategoryResponse(Category category);

    Dish toEntity(DishCreateRequest request, Set<Category> categories);

    default List<DishCategoryResponse> toCategoryList(Set<Category> categories) {
        return categories == null
                ? List.of()
                : categories.stream()
                        .map(this::toCategoryResponse)
                        .collect(Collectors.toList());
    }
}
