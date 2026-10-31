package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.rooms.RoomCategoryRequest;
import restaurant_management_be.dto.rooms.RoomCategoryResponse;
import restaurant_management_be.entities.RoomCategory;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoomCategoryMapper {

    RoomCategory toEntity(RoomCategoryRequest request);

    RoomCategoryResponse toResponse(RoomCategory entity);
}
