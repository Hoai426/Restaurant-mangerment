package restaurant_management_be.controllers;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.dto.dishes.DishCreateRequest;
import restaurant_management_be.dto.dishes.DishResponse;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.services.DishService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import restaurant_management_be.dto.dishes.DishUpdateRequest;
import restaurant_management_be.dto.dishes.DishUpdateStatusRequest;
import restaurant_management_be.services.DishService;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/api/dishes")
@RequiredArgsConstructor
public class DishController {

    private final DishService dishService;

    @GetMapping
    public ResponseEntity<SuccessResponse<List<DishResponse>>> getAllDishes() {
        return ResponseEntity.ok(SuccessResponse.ok(dishService.getAllDishes()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<DishResponse>> getDishById(@PathVariable Long id) {
        return ResponseEntity.ok(SuccessResponse.ok(dishService.getDishById(id)));
    }

    @PostMapping("/search")
    public ResponseEntity<SuccessResponse<Page<DishResponse>>> searchDishes(
            @RequestBody SearchRequest request, Pageable pageable) {
        return ResponseEntity.ok(SuccessResponse.ok(dishService.searchDishes(request, pageable)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<DishResponse>> createDish(
            @Valid @RequestBody DishCreateRequest request) {
        DishResponse result = dishService.createDish(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("Tạo món ăn thành công", result));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<DishResponse>> updateDish(
            @PathVariable Long id,
            @Valid @RequestBody DishUpdateRequest request) {
        DishResponse result = dishService.updateDish(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật món ăn thành công", result));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<DishResponse>> updateDishStatus(
            @PathVariable Long id,
            @Valid @RequestBody DishUpdateStatusRequest request) {
        DishResponse result = dishService.updateDishStatus(id, request);
        String message = Boolean.TRUE.equals(request.getIsAvailable())
                ? "Kích hoạt món ăn thành công"
                : "Ngừng bán món ăn thành công";
        return ResponseEntity.ok(SuccessResponse.ok(message, result));
    }
}
