package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.payments.PaymentResponse;
import restaurant_management_be.entities.Payment;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    default PaymentResponse toResponse(Payment payment) {
        return toResponse(payment, null);
    }

    @Mapping(source = "payment.order.id", target = "orderId")
    @Mapping(source = "payment.order.orderCode", target = "orderCode")
    PaymentResponse toResponse(Payment payment, String orderStatus);
}
