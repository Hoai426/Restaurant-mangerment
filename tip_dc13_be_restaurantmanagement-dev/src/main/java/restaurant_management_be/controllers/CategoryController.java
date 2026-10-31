package restaurant_management_be.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.dto.categories.CategoryCreateRequest;
import restaurant_management_be.dto.categories.CategoryResponse;
import restaurant_management_be.dto.categories.CategoryUpdateRequest;
import restaurant_management_be.dto.categories.CategoryUpdateStatusRequest;
import restaurant_management_be.services.CategoryService;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<SuccessResponse<List<CategoryResponse>>> getAllCategories() {
        return ResponseEntity.ok(SuccessResponse.ok(categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<CategoryResponse>> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(SuccessResponse.ok(categoryService.getCategoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryCreateRequest request) {
        CategoryResponse result = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("Tạo danh mục thành công", result));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        CategoryResponse result = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật danh mục thành công", result));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<CategoryResponse>> updateCategoryStatus(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateStatusRequest request) {
        CategoryResponse result = categoryService.updateCategoryStatus(id, request);
        String message = Boolean.TRUE.equals(request.getIsActive())
                ? "Kích hoạt danh mục thành công"
                : "Vô hiệu hóa danh mục thành công";
        return ResponseEntity.ok(SuccessResponse.ok(message, result));
    }
}
