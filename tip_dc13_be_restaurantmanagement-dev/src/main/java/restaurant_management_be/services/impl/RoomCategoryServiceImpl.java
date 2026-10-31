package restaurant_management_be.services.impl;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.dto.rooms.RoomCategoryRequest;
import restaurant_management_be.dto.rooms.RoomCategoryResponse;
import restaurant_management_be.dto.rooms.RoomCategoryUpdateStatusRequest;
import restaurant_management_be.entities.RoomCategory;
import restaurant_management_be.mapper.RoomCategoryMapper;
import restaurant_management_be.repository.RoomCategoryRepository;
import restaurant_management_be.services.RoomCategoryService;
import java.util.List;

@Service
public class RoomCategoryServiceImpl implements RoomCategoryService {

    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomCategoryMapper roomCategoryMapper;

    public RoomCategoryServiceImpl(RoomCategoryRepository roomCategoryRepository,
            RoomCategoryMapper roomCategoryMapper) {
        this.roomCategoryRepository = roomCategoryRepository;
        this.roomCategoryMapper = roomCategoryMapper;
    }

    @Override
    @Transactional
    public RoomCategoryResponse addRoomCategory(RoomCategoryRequest request) {
        if (roomCategoryRepository.findByName(request.getName()).isPresent()) {
            throw new AppException(ErrorCode.ROOM_CATEGORY_EXISTS, "Tên loại phòng đã tồn tại", HttpStatus.CONFLICT);
        }
        RoomCategory roomCategory = roomCategoryMapper.toEntity(request);
        RoomCategory saved = roomCategoryRepository.save(roomCategory);
        return roomCategoryMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public RoomCategoryResponse updateRoomCategory(Long id, RoomCategoryRequest request) {
        RoomCategory roomCategory = roomCategoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_CATEGORY_NOT_FOUND, "Không tìm thấy loại phòng",
                        HttpStatus.NOT_FOUND));

        roomCategory.setName(request.getName());
        roomCategory.setDescription(request.getDescription());
        RoomCategory updated = roomCategoryRepository.save(roomCategory);
        return roomCategoryMapper.toResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomCategoryResponse details(Long id) {
        RoomCategory roomCategory = roomCategoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_CATEGORY_NOT_FOUND, "Không tìm thấy loại phòng",
                        HttpStatus.NOT_FOUND));
        return roomCategoryMapper.toResponse(roomCategory);
    }

    @Override
    @Transactional
    public RoomCategoryResponse updateRoomCategoryStatus(Long id, RoomCategoryUpdateStatusRequest request) {
        RoomCategory roomCategory = roomCategoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_CATEGORY_NOT_FOUND, "Không tìm thấy loại phòng",
                        HttpStatus.NOT_FOUND));

        roomCategory.setIsActive(request.getIsActive());
        RoomCategory updated = roomCategoryRepository.save(roomCategory);
        return roomCategoryMapper.toResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<RoomCategoryResponse> getAllRoomCategories() {
        return roomCategoryRepository.findAll()
                .stream()
                .map(roomCategoryMapper::toResponse)
                .collect(Collectors.toList());
    }
}
