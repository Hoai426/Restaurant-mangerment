package restaurant_management_be.services;

import restaurant_management_be.common.specification.SearchRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import restaurant_management_be.dto.rooms.RoomCreateRequest;
import restaurant_management_be.dto.rooms.RoomResponse;
import restaurant_management_be.dto.rooms.RoomUpdateRequest;
import restaurant_management_be.dto.rooms.RoomUpdateStatusRequest;
import java.util.List;

public interface RoomService {

    RoomResponse createRoom(RoomCreateRequest request);
    RoomResponse updateRoom(Long id, RoomUpdateRequest request);
    RoomResponse getRoomById(Long id);
    RoomResponse updateRoomStatus(Long id, RoomUpdateStatusRequest request);
    List<RoomResponse> getAllRooms();
    Page<RoomResponse> searchRooms(SearchRequest request, Pageable pageable);

}