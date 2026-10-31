package restaurant_management_be.services.impl;

import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.specification.GenericSortBuilder;
import restaurant_management_be.common.specification.GenericSpecification;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.tables.TableCreateRequest;
import restaurant_management_be.dto.tables.TableResponse;
import restaurant_management_be.dto.tables.TableUpdateRequest;
import restaurant_management_be.dto.tables.TableUpdateStatusRequest;
import restaurant_management_be.entities.Room;
import restaurant_management_be.entities.Tables;
import restaurant_management_be.mapper.TableMapper;
import restaurant_management_be.repository.RoomRepository;
import restaurant_management_be.repository.TableRepository;
import restaurant_management_be.services.TableService;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class TableServiceImpl implements TableService {

    private final TableRepository tableRepository;
    private final RoomRepository roomRepository;
    private final TableMapper tableMapper;

    public TableServiceImpl(TableRepository tableRepository, RoomRepository roomRepository, TableMapper tableMapper) {
        this.tableRepository = tableRepository;
        this.roomRepository = roomRepository;
        this.tableMapper = tableMapper;
    }

    @Override
    @Transactional
    public TableResponse createTable(TableCreateRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng",
                        HttpStatus.NOT_FOUND));

        if (tableRepository.existsByRoomIdAndTableNumber(request.getRoomId(), request.getTableNumber())) {
            throw new AppException(ErrorCode.TABLE_EXISTS, "Số bàn đã tồn tại trong phòng này",
                    HttpStatus.CONFLICT);
        }

        Tables table = tableMapper.toEntity(request);
        table.setRoom(room);
        Tables saved = tableRepository.save(table);
        return tableMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TableResponse getTableById(Long id) {
        Tables table = tableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND, "Không tìm thấy bàn",
                        HttpStatus.NOT_FOUND));
        return tableMapper.toResponse(table);
    }

    @Override
    @Transactional
    public TableResponse updateTable(Long id, TableUpdateRequest request) {
        Tables table = tableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND, "Không tìm thấy bàn",
                        HttpStatus.NOT_FOUND));

        if (request.getRoomId() != null) {
            Room room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng",
                            HttpStatus.NOT_FOUND));
            table.setRoom(room);
        }
        if (request.getTableNumber() != null && !request.getTableNumber().isBlank()) {
            if (tableRepository.existsByRoomIdAndTableNumberAndIdNot(table.getRoom().getId(),
                    request.getTableNumber(), id)) {
                throw new AppException(ErrorCode.TABLE_EXISTS, "Số bàn đã tồn tại trong phòng này",
                        HttpStatus.CONFLICT);
            }
            table.setTableNumber(request.getTableNumber());
        }
        if (request.getCapacity() != null) {
            table.setCapacity(request.getCapacity());
        }

        Tables saved = tableRepository.save(table);
        return tableMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public TableResponse updateTableStatus(Long id, TableUpdateStatusRequest request) {
        Tables table = tableRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND, "Không tìm thấy bàn",
                        HttpStatus.NOT_FOUND));

        table.setStatus(request.getStatus());
        Tables saved = tableRepository.save(table);
        return tableMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TableResponse> getAllTables() {
        return tableRepository.findAll()
                .stream()
                .map(tableMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<TableResponse> searchTables(SearchRequest request, Pageable pageable) {
        GenericSpecification<Tables> spec = new GenericSpecification<>(request.getFilters());
        Pageable sortedPageable = GenericSortBuilder.applySorts(request.getSorts(), pageable);
        return tableRepository.findAll(spec, sortedPageable)
                .map(tableMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Tables> getTablesByIds(List<Long> ids) {
        List<Tables> tables = tableRepository.findAllById(ids);
        if (tables.size() != ids.size()) {
            throw new AppException(ErrorCode.TABLE_NOT_FOUND, "Không tìm thấy bàn",
                    HttpStatus.NOT_FOUND);
        }
        return tables;
    }

    @Override
    @Transactional
    public void markReserved(List<Long> tableIds) {
        if (tableIds == null || tableIds.isEmpty()) {
            return;
        }
        for (Tables table : tableRepository.findAllById(tableIds)) {
            if (table.getStatus() == Tables.Status.AVAILABLE) {
                table.setStatus(Tables.Status.RESERVED);
                tableRepository.save(table);
            }
        }
    }

    @Override
    @Transactional
    public void markAvailable(List<Long> tableIds) {
        if (tableIds == null || tableIds.isEmpty()) {
            return;
        }
        for (Tables table : tableRepository.findAllById(tableIds)) {
            if (table.getStatus() == Tables.Status.RESERVED) {
                table.setStatus(Tables.Status.AVAILABLE);
                tableRepository.save(table);
            }
        }
    }
}
