package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.rooms.RoomCreateRequest;
import restaurant_management_be.dto.rooms.RoomResponse;
import restaurant_management_be.entities.Room;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoomMapper {

    Room toEntity(RoomCreateRequest request);

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    RoomResponse toResponse(Room entity);
}
