package restaurant_management_be.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.dto.rooms.RoomCategoryRequest;
import restaurant_management_be.dto.rooms.RoomCategoryResponse;
import restaurant_management_be.dto.rooms.RoomCategoryUpdateStatusRequest;
import restaurant_management_be.services.RoomCategoryService;
import java.util.List;

@RestController
@RequestMapping("/api/room-categories")
public class RoomCategoryController {

    private final RoomCategoryService roomCategoryService;

    public RoomCategoryController(RoomCategoryService roomCategoryService) {
        this.roomCategoryService = roomCategoryService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SuccessResponse<RoomCategoryResponse>> addRoomCategory(
            @Valid @RequestBody RoomCategoryRequest request) {
        RoomCategoryResponse result = roomCategoryService.addRoomCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("Thêm loại phòng thành công", result));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<SuccessResponse<RoomCategoryResponse>> updateRoomcategories(
            @PathVariable Long id,
            @Valid @RequestBody RoomCategoryRequest request) {
        RoomCategoryResponse result = roomCategoryService.updateRoomCategory(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật loại phòng thành công", result));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER', 'STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<RoomCategoryResponse>> details(@PathVariable Long id) {
        RoomCategoryResponse result = roomCategoryService.details(id);
        return ResponseEntity.ok(SuccessResponse.ok(result));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<SuccessResponse<RoomCategoryResponse>> updateRoomCategoryStatus(
            @PathVariable Long id,
            @Valid @RequestBody RoomCategoryUpdateStatusRequest request) {
        RoomCategoryResponse result = roomCategoryService.updateRoomCategoryStatus(id, request);
        String message = Boolean.TRUE.equals(request.getIsActive())
                ? "Kích hoạt loại phòng thành công"
                : "Ngừng kích hoạt loại phòng thành công";
        return ResponseEntity.ok(SuccessResponse.ok(message, result));
    }

    @GetMapping
    public ResponseEntity<SuccessResponse<List<RoomCategoryResponse>>> getAllRoomCategories() {
        return ResponseEntity.ok(SuccessResponse.ok(roomCategoryService.getAllRoomCategories()));
    }
}
