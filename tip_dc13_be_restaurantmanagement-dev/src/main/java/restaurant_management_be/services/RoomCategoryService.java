package restaurant_management_be.services;

import restaurant_management_be.dto.rooms.RoomCategoryRequest;
import restaurant_management_be.dto.rooms.RoomCategoryResponse;
import restaurant_management_be.dto.rooms.RoomCategoryUpdateStatusRequest;
import java.util.List;

public interface RoomCategoryService {
    RoomCategoryResponse addRoomCategory(RoomCategoryRequest request);

    RoomCategoryResponse updateRoomCategory(Long id, RoomCategoryRequest request);

    RoomCategoryResponse details(Long id);

    RoomCategoryResponse updateRoomCategoryStatus(Long id, RoomCategoryUpdateStatusRequest request);

    List<RoomCategoryResponse> getAllRoomCategories();
}
