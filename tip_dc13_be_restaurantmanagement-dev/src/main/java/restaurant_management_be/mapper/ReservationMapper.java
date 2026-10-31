package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.reservations.ReservationCreateRequest;
import restaurant_management_be.dto.reservations.ReservationResponse;
import restaurant_management_be.entities.Reservation;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ReservationMapper {

    Reservation toEntity(ReservationCreateRequest request);

    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "createdBy.id", target = "createdById")
    @Mapping(source = "createdBy.fullName", target = "createdByName")
    @Mapping(source = "table.id", target = "tableId")
    @Mapping(source = "table.tableNumber", target = "tableNumber")
    @Mapping(source = "table.room.id", target = "roomId")
    @Mapping(source = "table.room.name", target = "roomName")
    ReservationResponse toResponse(Reservation entity);
}
