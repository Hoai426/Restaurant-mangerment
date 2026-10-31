package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.categories.CategoryCreateRequest;
import restaurant_management_be.dto.categories.CategoryResponse;
import restaurant_management_be.entities.Category;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    CategoryResponse toResponse(Category entity);

    Category toEntity(CategoryCreateRequest request);
}
