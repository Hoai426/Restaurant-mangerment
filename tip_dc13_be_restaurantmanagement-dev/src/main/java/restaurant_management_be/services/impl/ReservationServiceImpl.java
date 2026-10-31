package restaurant_management_be.services.impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.specification.GenericSortBuilder;
import restaurant_management_be.common.specification.GenericSpecification;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.reservations.ReservationCreateRequest;
import restaurant_management_be.dto.reservations.ReservationResponse;
import restaurant_management_be.dto.reservations.ReservationUpdateRequest;
import restaurant_management_be.dto.reservations.ReservationUpdateStatusRequest;
import restaurant_management_be.entities.Reservation;
import restaurant_management_be.entities.Tables;
import restaurant_management_be.entities.User;
import restaurant_management_be.mapper.ReservationMapper;
import restaurant_management_be.repository.ReservationRepository;
import restaurant_management_be.services.ReservationService;
import restaurant_management_be.services.TableService;
import restaurant_management_be.services.UserService;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import restaurant_management_be.common.specification.FilterCriteria;

@Service
public class ReservationServiceImpl implements ReservationService {

    private static final DateTimeFormatter CODE_DATETIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final ReservationRepository reservationRepository;
    private final TableService tableService;
    private final UserService userService;
    private final ReservationMapper reservationMapper;

    public ReservationServiceImpl(ReservationRepository reservationRepository,
            TableService tableService,
            UserService userService,
            ReservationMapper reservationMapper) {
        this.reservationRepository = reservationRepository;
        this.tableService = tableService;
        this.userService = userService;
        this.reservationMapper = reservationMapper;
    }

    @Override
    @Transactional
    public List<ReservationResponse> createReservation(ReservationCreateRequest request) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User createdBy = userService.findByUsername(currentUsername)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND,
                        "Không tìm thấy người dùng đang đăng nhập",
                        HttpStatus.NOT_FOUND));

        User customer = userService.findByPhone(request.getCustomerPhone()).orElse(null);

        List<Tables> tables = tableService.getTablesByIds(request.getTableIds());

        if (!request.getEndTime().isAfter(request.getStartTime())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Giờ kết thúc phải sau giờ bắt đầu",
                    HttpStatus.BAD_REQUEST);
        }

        List<Long> conflictIds = reservationRepository.findConflictingTableIds(
                request.getTableIds(), request.getReservationDate(),
                request.getStartTime(), request.getEndTime());
        if (!conflictIds.isEmpty()) {
            throw new AppException(ErrorCode.RESERVATION_CONFLICT,
                    "Một số bàn đã được đặt trong khung giờ này",
                    HttpStatus.CONFLICT);
        }

        String reservationCode = generateCode();
        List<ReservationResponse> responses = new ArrayList<>();
        for (Tables table : tables) {
            Reservation reservation = reservationMapper.toEntity(request);
            reservation.setReservationCode(reservationCode);
            reservation.setCustomer(customer);
            reservation.setCreatedBy(createdBy);
            reservation.setCreatedByRole(createdBy.getRole());
            reservation.setTable(table);
            Reservation saved = reservationRepository.save(reservation);
            responses.add(reservationMapper.toResponse(saved));
        }
        tableService.markReserved(tables.stream().map(Tables::getId).toList());
        return responses;
    }

    private String generateCode() {
        String code;
        do {
            code = "RSV-" + LocalDateTime.now().format(CODE_DATETIME)
                    + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        } while (reservationRepository.existsByReservationCode(code));
        return code;
    }

    @Override
    @Transactional
    public List<ReservationResponse> updateReservation(Long id, ReservationUpdateRequest request) {
        Reservation first = reservationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESERVATION_NOT_FOUND,
                        "Không tìm thấy đặt bàn",
                        HttpStatus.NOT_FOUND));

        List<Reservation> group = reservationRepository.findAllByReservationCode(first.getReservationCode());

        Reservation.Status currentStatus = group.get(0).getStatus();
        if (currentStatus != Reservation.Status.PENDING
                && currentStatus != Reservation.Status.CONFIRMED) {
            throw new AppException(ErrorCode.RESERVATION_NOT_EDITABLE,
                    "Đơn đặt bàn đã đóng, không thể chỉnh sửa",
                    HttpStatus.CONFLICT);
        }

        if (request.getCustomerPhone() != null && request.getCustomerPhone().isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Số điện thoại không được để trống",
                    HttpStatus.BAD_REQUEST);
        }
        if (request.getCustomerName() != null && request.getCustomerName().isBlank()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Tên khách hàng không được để trống",
                    HttpStatus.BAD_REQUEST);
        }

        LocalDate mergedDate = request.getReservationDate() != null
                ? request.getReservationDate()
                : first.getReservationDate();
        LocalTime mergedStart = request.getStartTime() != null
                ? request.getStartTime()
                : first.getStartTime();
        LocalTime mergedEnd = request.getEndTime() != null
                ? request.getEndTime()
                : first.getEndTime();
        if (!mergedEnd.isAfter(mergedStart)) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Giờ kết thúc phải sau giờ bắt đầu",
                    HttpStatus.BAD_REQUEST);
        }
        Integer mergedGuests = request.getNumberOfGuests() != null
                ? request.getNumberOfGuests()
                : first.getNumberOfGuests();
        String mergedName = request.getCustomerName() != null
                ? request.getCustomerName()
                : first.getCustomerName();
        String mergedPhone = request.getCustomerPhone() != null
                ? request.getCustomerPhone()
                : first.getCustomerPhone();
        String mergedNote = first.getNote();
        if (request.getNote() != null) {
            mergedNote = request.getNote().isBlank() ? null : request.getNote();
        }

        User mergedCustomer = first.getCustomer();
        boolean phoneChanged = request.getCustomerPhone() != null
                && !request.getCustomerPhone().equals(first.getCustomerPhone());
        if (phoneChanged) {
            mergedCustomer = userService.findByPhone(request.getCustomerPhone()).orElse(null);
        }

        Map<Long, Reservation> currentByTable = new LinkedHashMap<>();
        for (Reservation r : group) {
            currentByTable.putIfAbsent(r.getTable().getId(), r);
        }

        List<Tables> targetTables;
        List<Reservation> toDelete = new ArrayList<>();
        if (request.getTableIds() != null) {
            if (request.getTableIds().isEmpty()) {
                throw new AppException(ErrorCode.VALIDATION_FAILED,
                        "Danh sách bàn không được để trống",
                        HttpStatus.BAD_REQUEST);
            }
            targetTables = tableService.getTablesByIds(request.getTableIds());
            for (Map.Entry<Long, Reservation> e : currentByTable.entrySet()) {
                if (!request.getTableIds().contains(e.getKey())) {
                    toDelete.add(e.getValue());
                }
            }
        } else {
            targetTables = new ArrayList<>();
            for (Reservation r : group) {
                targetTables.add(r.getTable());
            }
        }

        List<Long> targetTableIds = targetTables.stream()
                .map(Tables::getId)
                .distinct()
                .toList();
        List<Long> excludeIds = group.stream()
                .map(Reservation::getId)
                .toList();

        List<Long> conflictIds = reservationRepository.findConflictingTableIdsExcluding(
                targetTableIds, mergedDate, mergedStart, mergedEnd, excludeIds);
        if (!conflictIds.isEmpty()) {
            throw new AppException(ErrorCode.RESERVATION_CONFLICT,
                    "Một số bàn đã được đặt trong khung giờ này",
                    HttpStatus.CONFLICT);
        }

        List<ReservationResponse> responses = new ArrayList<>();
        for (Tables table : targetTables) {
            Reservation reservation = currentByTable.get(table.getId());
            if (reservation == null) {
                reservation = new Reservation();
                reservation.setReservationCode(first.getReservationCode());
                reservation.setTable(table);
                reservation.setStatus(currentStatus);
                reservation.setCreatedBy(first.getCreatedBy());
                reservation.setCreatedByRole(first.getCreatedByRole());
            }
            reservation.setReservationDate(mergedDate);
            reservation.setStartTime(mergedStart);
            reservation.setEndTime(mergedEnd);
            reservation.setNumberOfGuests(mergedGuests);
            reservation.setCustomerName(mergedName);
            reservation.setCustomerPhone(mergedPhone);
            reservation.setNote(mergedNote);
            reservation.setCustomer(mergedCustomer);
            responses.add(reservationMapper.toResponse(reservationRepository.save(reservation)));
        }
        for (Reservation remove : toDelete) {
            reservationRepository.delete(remove);
        }

        List<Long> freedIds = new ArrayList<>();
        for (Reservation remove : toDelete) {
            Long tableId = remove.getTable().getId();
            if (reservationRepository.countActiveByTableExcluding(tableId, excludeIds) == 0) {
                freedIds.add(tableId);
            }
        }
        tableService.markAvailable(freedIds);
        tableService.markReserved(targetTableIds);
        return responses;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationResponse> getReservationDetail(Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESERVATION_NOT_FOUND,
                        "Không tìm thấy đặt bàn",
                        HttpStatus.NOT_FOUND));
        List<Reservation> group = reservationRepository.findAllByReservationCode(reservation.getReservationCode());

        boolean isCustomer = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> "ROLE_CUSTOMER".equals(a.getAuthority()));
        if (isCustomer) {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            User current = userService.findByUsername(currentUsername)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND,
                            "Không tìm thấy người dùng đang đăng nhập",
                            HttpStatus.NOT_FOUND));
            boolean owns = (reservation.getCreatedBy() != null
                    && reservation.getCreatedBy().getId().equals(current.getId()))
                    || (reservation.getCustomer() != null
                            && reservation.getCustomer().getId().equals(current.getId()));
            if (!owns) {
                throw new AppException(ErrorCode.RESERVATION_NOT_FOUND,
                        "Không tìm thấy đặt bàn",
                        HttpStatus.NOT_FOUND);
            }
        }

        return group.stream()
                .map(reservationMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReservationResponse> searchReservations(SearchRequest request, Pageable pageable) {
        GenericSpecification<Reservation> spec = new GenericSpecification<>(convertFilters(request.getFilters()));
        Pageable sortedPageable = GenericSortBuilder.applySorts(request.getSorts(), pageable);
        return reservationRepository.findAll(spec, sortedPageable)
                .map(reservationMapper::toResponse);
    }

    private List<FilterCriteria> convertFilters(List<FilterCriteria> filters) {
        if (filters == null || filters.isEmpty()) {
            return filters;
        }
        List<FilterCriteria> converted = new ArrayList<>();
        for (FilterCriteria f : filters) {
            converted.add(new FilterCriteria(f.getField(), convertValue(f.getField(), f.getValue()),
                    f.getOperation()));
        }
        return converted;
    }

    private Object convertValue(String field, Object value) {
        if (field == null || value == null || value.getClass().isEnum()) {
            return value;
        }
        try {
            switch (field) {
                case "reservationDate" -> {
                    return LocalDate.parse(String.valueOf(value));
                }
                case "status" -> {
                    return Reservation.Status.valueOf(String.valueOf(value));
                }
                case "table.id" -> {
                    return Long.parseLong(String.valueOf(value));
                }
                default -> {
                    return value;
                }
            }
        } catch (RuntimeException e) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Giá trị filter không hợp lệ", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    @Transactional
    public List<ReservationResponse> updateReservationStatus(Long id,
            ReservationUpdateStatusRequest request) {
        Reservation.Status target = request.getStatus();

        Reservation first = reservationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESERVATION_NOT_FOUND,
                        "Không tìm thấy đặt bàn",
                        HttpStatus.NOT_FOUND));
        List<Reservation> group = reservationRepository.findAllByReservationCode(first.getReservationCode());

        if (target == Reservation.Status.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Trạng thái không hợp lệ",
                    HttpStatus.BAD_REQUEST);
        }

        Reservation.Status current = group.get(0).getStatus();
        if (target != current
                && current != Reservation.Status.PENDING
                && current != Reservation.Status.CONFIRMED) {
            throw new AppException(ErrorCode.RESERVATION_NOT_EDITABLE,
                    "Đơn đặt bàn đã đóng, không thể chỉnh sửa",
                    HttpStatus.CONFLICT);
        }
        if (target == current) {
            return group.stream()
                    .map(reservationMapper::toResponse)
                    .toList();
        }

        List<Long> excludeIds = group.stream()
                .map(Reservation::getId)
                .toList();
        for (Reservation r : group) {
            r.setStatus(target);
            reservationRepository.save(r);
        }

        if (target == Reservation.Status.CANCELLED
                || target == Reservation.Status.COMPLETED
                || target == Reservation.Status.NO_SHOW) {
            List<Long> releasedIds = new ArrayList<>();
            for (Reservation r : group) {
                Long tableId = r.getTable().getId();
                if (reservationRepository.countActiveByTableExcluding(tableId, excludeIds) == 0) {
                    releasedIds.add(tableId);
                }
            }
            tableService.markAvailable(releasedIds);
        }

        return group.stream()
                .map(reservationMapper::toResponse)
                .toList();
    }
}
