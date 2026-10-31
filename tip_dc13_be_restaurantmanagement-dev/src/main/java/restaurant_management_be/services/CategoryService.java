package restaurant_management_be.services;

import restaurant_management_be.dto.categories.CategoryResponse;
import restaurant_management_be.dto.categories.CategoryCreateRequest;
import restaurant_management_be.dto.categories.CategoryUpdateRequest;
import restaurant_management_be.dto.categories.CategoryUpdateStatusRequest;
import java.util.List;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Long id);
    CategoryResponse createCategory(CategoryCreateRequest request);
    CategoryResponse updateCategory(Long id, CategoryUpdateRequest request);
    CategoryResponse updateCategoryStatus(Long id, CategoryUpdateStatusRequest request);

}
