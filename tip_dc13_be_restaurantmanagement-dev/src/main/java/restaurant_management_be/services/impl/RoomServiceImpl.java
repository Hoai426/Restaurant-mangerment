package restaurant_management_be.services.impl;

import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.specification.GenericSortBuilder;
import restaurant_management_be.common.specification.GenericSpecification;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.rooms.RoomCreateRequest;
import restaurant_management_be.dto.rooms.RoomResponse;
import restaurant_management_be.entities.Room;
import restaurant_management_be.entities.RoomCategory;
import restaurant_management_be.mapper.RoomMapper;
import restaurant_management_be.repository.RoomCategoryRepository;
import restaurant_management_be.repository.RoomRepository;
import restaurant_management_be.services.RoomService;
import restaurant_management_be.dto.rooms.RoomUpdateRequest;
import restaurant_management_be.dto.rooms.RoomUpdateStatusRequest;
import java.util.List;

@Service
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomMapper roomMapper;

    public RoomServiceImpl(RoomRepository roomRepository,
            RoomCategoryRepository roomCategoryRepository,
            RoomMapper roomMapper) {
        this.roomRepository = roomRepository;
        this.roomCategoryRepository = roomCategoryRepository;
        this.roomMapper = roomMapper;
    }

    @Override
    @Transactional
    public RoomResponse createRoom(RoomCreateRequest request) {
        RoomCategory category = roomCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_CATEGORY_NOT_FOUND, "Không tìm thấy loại phòng",
                        HttpStatus.NOT_FOUND));

        Room room = roomMapper.toEntity(request);
        room.setCategory(category);
        Room saved = roomRepository.save(room);
        return roomMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RoomResponse updateRoom(Long id, RoomUpdateRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND,
                        "Không tìm thấy phòng",
                        HttpStatus.NOT_FOUND));

        if (request.getCategoryId() != null) {
            RoomCategory category = roomCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_CATEGORY_NOT_FOUND,
                            "Không tìm thấy loại phòng",
                            HttpStatus.NOT_FOUND));
            room.setCategory(category);
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            room.setName(request.getName());
        }
        if (request.getDescription() != null) {
            room.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            room.setImageUrl(request.getImageUrl());
        }

        Room saved = roomRepository.save(room);
        return roomMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND,
                        "Không tìm thấy phòng",
                        HttpStatus.NOT_FOUND));
        return roomMapper.toResponse(room);
    }

    @Override
    @Transactional
    public RoomResponse updateRoomStatus(Long id, RoomUpdateStatusRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND,
                        "Không tìm thấy phòng",
                        HttpStatus.NOT_FOUND));

        room.setIsActive(request.getIsActive());
        Room saved = roomRepository.save(room);
        return roomMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll()
                .stream()
                .map(roomMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomResponse> searchRooms(SearchRequest request, Pageable pageable) {
        GenericSpecification<Room> spec = new GenericSpecification<>(request.getFilters());
        Pageable sortedPageable = GenericSortBuilder.applySorts(request.getSorts(), pageable);
        return roomRepository.findAll(spec, sortedPageable)
                .map(roomMapper::toResponse);
    }
}