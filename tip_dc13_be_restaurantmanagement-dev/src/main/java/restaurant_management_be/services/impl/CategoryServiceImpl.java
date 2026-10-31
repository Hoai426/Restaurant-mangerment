package restaurant_management_be.services.impl;

import lombok.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.dto.categories.CategoryResponse;
import restaurant_management_be.mapper.CategoryMapper;
import restaurant_management_be.repository.CategoryRepository;
import restaurant_management_be.services.CategoryService;
import restaurant_management_be.dto.categories.CategoryCreateRequest;
import restaurant_management_be.entities.Category;
import restaurant_management_be.dto.categories.CategoryUpdateRequest;
import restaurant_management_be.dto.categories.CategoryUpdateStatusRequest;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(categoryMapper::toResponse)
                .orElseThrow(() -> new AppException(
                        ErrorCode.CATEGORY_NOT_FOUND,
                        "Danh mục không tồn tại",
                        HttpStatus.NOT_FOUND));
    }

    @Override
    @Transactional
    public CategoryResponse createCategory(CategoryCreateRequest request) {
        if (categoryRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(
                    ErrorCode.CATEGORY_EXISTS,
                    "Danh mục đã tồn tại",
                    HttpStatus.CONFLICT);
        }

        Category category = categoryMapper.toEntity(request);
        Category savedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(savedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, CategoryUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        ErrorCode.CATEGORY_NOT_FOUND,
                        "Danh mục không tồn tại",
                        HttpStatus.NOT_FOUND));

        if (request.getName() != null && !request.getName().isBlank()) {
            String newName = request.getName().trim();
            if (!newName.equals(category.getName())) {
                if (categoryRepository.existsByNameAndIdNot(newName, category.getId())) {
                    throw new AppException(
                            ErrorCode.CATEGORY_EXISTS,
                            "Danh mục đã tồn tại",
                            HttpStatus.CONFLICT);
                }
                category.setName(newName);
            }
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription().trim());
        }

        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(updatedCategory);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategoryStatus(Long id, CategoryUpdateStatusRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(
                        ErrorCode.CATEGORY_NOT_FOUND,
                        "Danh mục không tồn tại",
                        HttpStatus.NOT_FOUND));

        category.setIsActive(request.getIsActive());
        Category updatedCategory = categoryRepository.save(category);
        return categoryMapper.toResponse(updatedCategory);
    }
}
