package restaurant_management_be.controllers;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.rooms.RoomCreateRequest;
import restaurant_management_be.dto.rooms.RoomResponse;
import restaurant_management_be.services.RoomService;
import restaurant_management_be.dto.rooms.RoomUpdateRequest;
import restaurant_management_be.dto.rooms.RoomUpdateStatusRequest;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<SuccessResponse<RoomResponse>> createRoom(
            @Valid @RequestBody RoomCreateRequest request) {
        RoomResponse result = roomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("Tạo phòng thành công", result));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<SuccessResponse<RoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomUpdateRequest request) {
        RoomResponse result = roomService.updateRoom(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật phòng thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<RoomResponse>> getRoomById(@PathVariable Long id) {
        RoomResponse result = roomService.getRoomById(id);
        return ResponseEntity.ok(SuccessResponse.ok(result));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<SuccessResponse<RoomResponse>> updateRoomStatus(
            @PathVariable Long id,
            @Valid @RequestBody RoomUpdateStatusRequest request) {
        RoomResponse result = roomService.updateRoomStatus(id, request);
        String message = Boolean.TRUE.equals(request.getIsActive())
                ? "Kích hoạt phòng thành công"
                : "Ngừng kích hoạt phòng thành công";
        return ResponseEntity.ok(SuccessResponse.ok(message, result));
    }

    @GetMapping
    public ResponseEntity<SuccessResponse<List<RoomResponse>>> getAllRooms() {
        return ResponseEntity.ok(SuccessResponse.ok(roomService.getAllRooms()));
    }

    @PostMapping("/search")
    public ResponseEntity<SuccessResponse<Page<RoomResponse>>> searchRooms(
            @RequestBody SearchRequest request, Pageable pageable) {
        return ResponseEntity.ok(SuccessResponse.ok(roomService.searchRooms(request, pageable)));
    }
}