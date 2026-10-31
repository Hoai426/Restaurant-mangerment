package restaurant_management_be.services.impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.common.specification.GenericSortBuilder;
import restaurant_management_be.common.specification.GenericSpecification;
import restaurant_management_be.common.specification.SearchRequest;
import restaurant_management_be.dto.orders.OrderCreateRequest;
import restaurant_management_be.dto.orders.OrderItemCreateRequest;
import restaurant_management_be.dto.orders.OrderResponse;
import restaurant_management_be.dto.orders.OrderUpdateRequest;
import restaurant_management_be.dto.orders.OrderUpdateStatusRequest;
import restaurant_management_be.dto.tables.TableUpdateStatusRequest;
import restaurant_management_be.entities.Dish;
import restaurant_management_be.entities.Order;
import restaurant_management_be.entities.OrderItem;
import restaurant_management_be.entities.Tables;
import restaurant_management_be.entities.User;
import restaurant_management_be.mapper.OrderMapper;
import restaurant_management_be.repository.OrderRepository;
import restaurant_management_be.services.DishService;
import restaurant_management_be.services.OrderService;
import restaurant_management_be.services.PaymentService;
import restaurant_management_be.services.TableService;
import restaurant_management_be.services.UserService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import restaurant_management_be.common.specification.FilterOperation;

@Service
public class OrderServiceImpl implements OrderService {

    private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final OrderRepository orderRepository;
    private final TableService tableService;
    private final DishService dishService;
    private final UserService userService;
    private final OrderMapper orderMapper;
    private final PaymentService paymentService;

    public OrderServiceImpl(OrderRepository orderRepository,
            TableService tableService,
            DishService dishService,
            UserService userService,
            OrderMapper orderMapper,
            PaymentService paymentService) {
        this.orderRepository = orderRepository;
        this.tableService = tableService;
        this.dishService = dishService;
        this.userService = userService;
        this.orderMapper = orderMapper;
        this.paymentService = paymentService;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(OrderCreateRequest request) {
        User createdBy = userService.findByUsername(
                SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND,
                        "Không tìm thấy người dùng đang đăng nhập",
                        HttpStatus.NOT_FOUND));

        Tables table = tableService.getTablesByIds(List.of(request.getTableId())).get(0);

        if (table.getStatus() == Tables.Status.RESERVED) {
            throw new AppException(ErrorCode.ORDER_TABLE_RESERVED,
                    "Bàn đã được đặt trước, không thể tạo đơn trực tiếp",
                    HttpStatus.CONFLICT);
        }

        List<Long> dishIds = request.getItems().stream()
                .map(OrderItemCreateRequest::getDishId)
                .distinct()
                .toList();
        if (dishIds.size() != request.getItems().size()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Món ăn bị trùng trong đơn hàng",
                    HttpStatus.BAD_REQUEST);
        }

        List<Dish> dishes = dishService.getDishesByIds(dishIds);
        for (Dish dish : dishes) {
            if (!Boolean.TRUE.equals(dish.getIsAvailable())) {
                throw new AppException(ErrorCode.DISH_UNAVAILABLE,
                        "Món ăn đã ngừng bán: " + dish.getName(),
                        HttpStatus.CONFLICT);
            }
        }

        if (request.getNumberOfGuests() != null
                && request.getNumberOfGuests() > table.getCapacity()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Số khách vượt quá sức chứa của bàn",
                    HttpStatus.BAD_REQUEST);
        }

        Order order = new Order();
        order.setOrderCode(generateOrderCode());
        order.setTable(table);
        order.setCreatedBy(createdBy);
        order.setStatus(Order.Status.PENDING);
        order.setNumberOfGuests(request.getNumberOfGuests());
        order.setNote(request.getNote());
        order.setTotalAmount(BigDecimal.ZERO);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemCreateRequest itemRequest : request.getItems()) {
            Dish dish = dishes.stream()
                    .filter(d -> d.getId().equals(itemRequest.getDishId()))
                    .findFirst().orElseThrow();
            BigDecimal subtotal = dish.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            total = total.add(subtotal);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setDish(dish);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(dish.getPrice());
            item.setSubtotal(subtotal);
            item.setNote(itemRequest.getNote());
            order.getItems().add(item);
        }
        order.setTotalAmount(total);

        Order saved = orderRepository.save(order);

        if (table.getStatus() == Tables.Status.AVAILABLE) {
            tableService.updateTableStatus(table.getId(),
                    new TableUpdateStatusRequest(Tables.Status.OCCUPIED));
        }

        return orderMapper.toResponse(saved);
    }

    private String generateOrderCode() {
        String code;
        do {
            code = "ORD-" + LocalDateTime.now().format(CODE_DATE)
                    + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        } while (orderRepository.existsByOrderCode(code));
        return code;
    }

    @Override
    @Transactional
    public OrderResponse updateOrder(Long id, OrderUpdateRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND,
                        "Không tìm thấy đơn hàng",
                        HttpStatus.NOT_FOUND));

        if (order.getStatus() != Order.Status.PENDING
                && order.getStatus() != Order.Status.CONFIRMED) {
            throw new AppException(ErrorCode.ORDER_NOT_EDITABLE,
                    "Đơn hàng đã đóng, không thể chỉnh sửa",
                    HttpStatus.CONFLICT);
        }

        Tables originalTable = order.getTable();
        Tables targetTable = originalTable;
        if (request.getTableId() != null) {
            targetTable = tableService.getTablesByIds(List.of(request.getTableId())).stream()
                    .findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.TABLE_NOT_FOUND,
                            "Không tìm thấy bàn",
                            HttpStatus.NOT_FOUND));
            if (targetTable.getStatus() == Tables.Status.RESERVED) {
                throw new AppException(ErrorCode.ORDER_TABLE_RESERVED,
                        "Bàn đã được đặt trước, không thể tạo đơn trực tiếp",
                        HttpStatus.CONFLICT);
            }
            if (targetTable.getStatus() == Tables.Status.OCCUPIED) {
                throw new AppException(ErrorCode.ORDER_TABLE_RESERVED,
                        "Bàn đang có khách, không thể chuyển đơn sang bàn này",
                        HttpStatus.CONFLICT);
            }
        }

        if (request.getNumberOfGuests() != null) {
            if (request.getNumberOfGuests() > targetTable.getCapacity()) {
                throw new AppException(ErrorCode.VALIDATION_FAILED,
                        "Số khách vượt quá sức chứa của bàn",
                        HttpStatus.BAD_REQUEST);
            }
            order.setNumberOfGuests(request.getNumberOfGuests());
        }

        if (request.isNoteProvided()) {
            order.setNote(request.getNote() == null || request.getNote().isBlank()
                    ? null
                    : request.getNote());
        }

        List<Long> dishIds = request.getItems().stream()
                .map(OrderItemCreateRequest::getDishId)
                .distinct()
                .toList();
        if (dishIds.size() != request.getItems().size()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Món ăn bị trùng trong đơn hàng",
                    HttpStatus.BAD_REQUEST);
        }

        List<Dish> dishes = dishService.getDishesByIds(dishIds);
        for (Dish dish : dishes) {
            if (!Boolean.TRUE.equals(dish.getIsAvailable())) {
                throw new AppException(ErrorCode.DISH_UNAVAILABLE,
                        "Món ăn đã ngừng bán: " + dish.getName(),
                        HttpStatus.CONFLICT);
            }
        }

        BigDecimal total = BigDecimal.ZERO;
        order.getItems().clear();
        for (OrderItemCreateRequest itemRequest : request.getItems()) {
            Dish dish = dishes.stream()
                    .filter(d -> d.getId().equals(itemRequest.getDishId()))
                    .findFirst().orElseThrow();
            BigDecimal subtotal = dish.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));
            total = total.add(subtotal);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setDish(dish);
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(dish.getPrice());
            item.setSubtotal(subtotal);
            item.setNote(itemRequest.getNote());
            order.getItems().add(item);
        }
        order.setTotalAmount(total);

        if (targetTable != originalTable) {
            order.setTable(targetTable);

            if (orderRepository.countActiveByTableExcluding(originalTable.getId(),
                    List.of(order.getId())) == 0
                    && originalTable.getStatus() == Tables.Status.OCCUPIED) {
                tableService.updateTableStatus(originalTable.getId(),
                        new TableUpdateStatusRequest(Tables.Status.AVAILABLE));
            }

            if (targetTable.getStatus() == Tables.Status.AVAILABLE) {
                tableService.updateTableStatus(targetTable.getId(),
                        new TableUpdateStatusRequest(Tables.Status.OCCUPIED));
            }
        }

        Order saved = orderRepository.save(order);
        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderDetail(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND,
                        "Không tìm thấy đơn hàng",
                        HttpStatus.NOT_FOUND));
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> searchOrders(SearchRequest request, Pageable pageable) {
        List<FilterCriteria> filters = request.getFilters();
        GenericSpecification<Order> spec = new GenericSpecification<>(convertFilters(
                filters == null ? null : filters.stream()
                        .filter(f -> !"createdAt".equals(f.getField()))
                        .toList()));
        Specification<Order> combined = spec.and(createdAtSpecification(filters));
        Pageable sortedPageable = GenericSortBuilder.applySorts(request.getSorts(), pageable);
        return orderRepository.findAll(combined, sortedPageable)
                .map(orderMapper::toResponse);
    }

    private Specification<Order> createdAtSpecification(List<FilterCriteria> filters) {
        return (root, query, builder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (filters == null) {
                return builder.conjunction();
            }
            for (FilterCriteria f : filters) {
                if (!"createdAt".equals(f.getField()) || f.getValue() == null) {
                    continue;
                }
                LocalDateTime value = parseDateTime(f.getValue());
                FilterOperation op = f.getOperation() == null ? FilterOperation.EQ : f.getOperation();
                switch (op) {
                    case GT -> predicates.add(builder.greaterThan(root.get("createdAt"), value));
                    case GTE -> predicates.add(builder.greaterThanOrEqualTo(root.get("createdAt"), value));
                    case LT -> predicates.add(builder.lessThan(root.get("createdAt"), value));
                    case LTE -> predicates.add(builder.lessThanOrEqualTo(root.get("createdAt"), value));
                    default -> predicates.add(builder.equal(root.get("createdAt"), value));
                }
            }
            return builder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private LocalDateTime parseDateTime(Object value) {
        String s = String.valueOf(value);
        try {
            return s.length() <= 10
                    ? LocalDate.parse(s).atStartOfDay()
                    : LocalDateTime.parse(s);
        } catch (RuntimeException e) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Giá trị filter không hợp lệ", HttpStatus.BAD_REQUEST);
        }
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
                case "status" -> {
                    return Order.Status.valueOf(String.valueOf(value));
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
    public OrderResponse updateOrderStatus(Long id, OrderUpdateStatusRequest request) {
        Order.Status target = request.getStatus();

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND,
                        "Không tìm thấy đơn hàng",
                        HttpStatus.NOT_FOUND));

        if (target == Order.Status.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Trạng thái không hợp lệ",
                    HttpStatus.BAD_REQUEST);
        }

        Order.Status current = order.getStatus();
        if (target != current
                && current != Order.Status.PENDING
                && current != Order.Status.CONFIRMED) {
            throw new AppException(ErrorCode.ORDER_NOT_EDITABLE,
                    "Đơn hàng đã đóng, không thể chỉnh sửa",
                    HttpStatus.CONFLICT);
        }
        if (target == Order.Status.CANCELLED
                && paymentService.hasSuccessfulPayment(order.getId())) {
            throw new AppException(ErrorCode.ORDER_ALREADY_PAID,
                    "Đơn hàng đã được thanh toán, không thể hủy",
                    HttpStatus.CONFLICT);
        }
        if (target == current) {
            return orderMapper.toResponse(order);
        }

        order.setStatus(target);
        Order saved = orderRepository.save(order);

        if (target == Order.Status.CANCELLED
                || target == Order.Status.COMPLETED) {
            Long tableId = saved.getTable().getId();
            if (orderRepository.countActiveByTableExcluding(tableId, List.of(saved.getId())) == 0) {
                tableService.updateTableStatus(tableId,
                    new TableUpdateStatusRequest(Tables.Status.AVAILABLE));
            }
        }

        return orderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> getOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(orderMapper::toResponse);
    }
}
