package restaurant_management_be.controllers;

import jakarta.validation.Valid;
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
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.orders.OrderCreateRequest;
import restaurant_management_be.dto.orders.OrderResponse;
import restaurant_management_be.dto.orders.OrderUpdateRequest;
import restaurant_management_be.dto.orders.OrderUpdateStatusRequest;
import restaurant_management_be.services.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SuccessResponse<OrderResponse>> createOrder(
            @Valid @RequestBody OrderCreateRequest request) {
        OrderResponse result = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SuccessResponse.created("Tạo đơn hàng thành công", result));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/{id}")
    public ResponseEntity<SuccessResponse<OrderResponse>> updateOrder(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateRequest request) {
        OrderResponse result = orderService.updateOrder(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật đơn hàng thành công", result));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SuccessResponse<OrderResponse>> getOrderDetail(
            @PathVariable Long id) {
        OrderResponse result = orderService.getOrderDetail(id);
        return ResponseEntity.ok(SuccessResponse.ok(result));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PostMapping("/search")
    public ResponseEntity<SuccessResponse<Page<OrderResponse>>> searchOrders(
            @RequestBody SearchRequest request, Pageable pageable) {
        return ResponseEntity.ok(SuccessResponse.ok(
                orderService.searchOrders(request, pageable)));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<SuccessResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderUpdateStatusRequest request) {
        OrderResponse result = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(SuccessResponse.ok("Cập nhật trạng thái đơn hàng thành công", result));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<SuccessResponse<Page<OrderResponse>>> getOrders(Pageable pageable) {
        return ResponseEntity.ok(SuccessResponse.ok(orderService.getOrders(pageable)));
    }
}
