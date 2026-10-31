package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.tables.TableCreateRequest;
import restaurant_management_be.dto.tables.TableResponse;
import restaurant_management_be.entities.Tables;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TableMapper {

    Tables toEntity(TableCreateRequest request);

    @Mapping(source = "room.id", target = "roomId")
    @Mapping(source = "room.name", target = "roomName")
    TableResponse toResponse(Tables entity);
}
