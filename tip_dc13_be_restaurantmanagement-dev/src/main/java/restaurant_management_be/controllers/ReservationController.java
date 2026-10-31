package restaurant_management_be.controllers;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import restaurant_management_be.common.response.SuccessResponse;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.reservations.ReservationCreateRequest;
import restaurant_management_be.dto.reservations.ReservationResponse;
import restaurant_management_be.services.ReservationService;
import restaurant_management_be.dto.reservations.ReservationUpdateRequest;
import restaurant_management_be.dto.reservations.ReservationUpdateStatusRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<SuccessResponse<List<ReservationResponse>>> createReservation(
            @Valid @RequestBody ReservationCreateRequest request) {
        List<ReservationResponse> result = reservationService.createReservation(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("Tạo đặt bàn thành công", result));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/{id}")
    public ResponseEntity<SuccessResponse<List<ReservationResponse>>> updateReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationUpdateRequest request) {
        List<ReservationResponse> result = reservationService.updateReservation(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật thông tin đặt bàn thành công", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuccessResponse<List<ReservationResponse>>> getReservationDetail(
            @PathVariable Long id) {
        List<ReservationResponse> result = reservationService.getReservationDetail(id);
        return ResponseEntity.ok(SuccessResponse.ok(result));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PostMapping("/search")
    public ResponseEntity<SuccessResponse<Page<ReservationResponse>>> searchReservations(
            @RequestBody SearchRequest request, Pageable pageable) {
        return ResponseEntity.ok(SuccessResponse.ok(
                reservationService.searchReservations(request, pageable)));
    }

     @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<SuccessResponse<List<ReservationResponse>>> updateReservationStatus(
            @PathVariable Long id,
            @Valid @RequestBody ReservationUpdateStatusRequest request) {
        List<ReservationResponse> result = reservationService.updateReservationStatus(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật trạng thái đặt bàn thành công", result));
    }
}
