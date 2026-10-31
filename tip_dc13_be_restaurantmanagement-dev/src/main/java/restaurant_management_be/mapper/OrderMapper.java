package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.orders.OrderItemResponse;
import restaurant_management_be.dto.orders.OrderResponse;
import restaurant_management_be.entities.Order;
import restaurant_management_be.entities.OrderItem;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    @Mapping(source = "table.id", target = "tableId")
    @Mapping(source = "table.tableNumber", target = "tableNumber")
    @Mapping(source = "table.room.name", target = "roomName")
    OrderResponse toResponse(Order entity);

    @Mapping(source = "dish.id", target = "dishId")
    @Mapping(source = "dish.name", target = "dishName")
    @Mapping(source = "unitPrice", target = "price")
    OrderItemResponse toItemResponse(OrderItem item);
}
