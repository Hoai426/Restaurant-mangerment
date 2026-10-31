package restaurant_management_be.services;

import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.orders.OrderCreateRequest;
import restaurant_management_be.dto.orders.OrderResponse;
import restaurant_management_be.dto.orders.OrderUpdateRequest;
import restaurant_management_be.dto.orders.OrderUpdateStatusRequest;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponse createOrder(OrderCreateRequest request);
    OrderResponse updateOrder(Long id, OrderUpdateRequest request);
    OrderResponse getOrderDetail(Long id);
    Page<OrderResponse> searchOrders(SearchRequest request, Pageable pageable);
    OrderResponse updateOrderStatus(Long id, OrderUpdateStatusRequest request);
    Page<OrderResponse> getOrders(Pageable pageable);
}

