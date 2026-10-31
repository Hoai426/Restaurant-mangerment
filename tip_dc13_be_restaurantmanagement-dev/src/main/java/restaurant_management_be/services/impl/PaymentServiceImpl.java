package restaurant_management_be.services.impl;

import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.dto.payments.PaymentConfirmRequest;
import restaurant_management_be.dto.payments.PaymentCreateRequest;
import restaurant_management_be.dto.payments.PaymentResponse;
import restaurant_management_be.dto.tables.TableUpdateStatusRequest;
import restaurant_management_be.entities.Order;
import restaurant_management_be.entities.Payment;
import restaurant_management_be.entities.Tables;
import restaurant_management_be.mapper.PaymentMapper;
import restaurant_management_be.repository.OrderRepository;
import restaurant_management_be.repository.PaymentRepository;
import restaurant_management_be.services.PaymentService;
import restaurant_management_be.services.TableService;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final DateTimeFormatter CODE_DATETIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final PaymentMapper paymentMapper;
    private final TableService tableService;

    public PaymentServiceImpl(PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            PaymentMapper paymentMapper,
            TableService tableService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.paymentMapper = paymentMapper;
        this.tableService = tableService;
    }

    @Override
    @Transactional
    public PaymentResponse createPayment(Long orderId, PaymentCreateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND,
                        "Không tìm thấy đơn hàng",
                        HttpStatus.NOT_FOUND));

        if (order.getStatus() != Order.Status.PENDING
                && order.getStatus() != Order.Status.CONFIRMED) {
            throw new AppException(ErrorCode.ORDER_NOT_EDITABLE,
                    "Đơn hàng đã đóng, không thể thanh toán",
                    HttpStatus.CONFLICT);
        }

        if (paymentRepository.existsByOrderId(orderId)) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_EXISTS,
                    "Đơn hàng đã được thanh toán",
                    HttpStatus.CONFLICT);
        }

        if (order.getTotalAmount() == null
                || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Đơn hàng chưa có món để thanh toán",
                    HttpStatus.BAD_REQUEST);
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(Payment.Status.PENDING);
        payment.setTransactionCode(generateTransactionCode());
        try {
            Payment saved = paymentRepository.save(payment);
            paymentRepository.flush();
            return paymentMapper.toResponse(saved);
        } catch (DataIntegrityViolationException e) {
            if (isDuplicateOrderPayment(e)) {
                throw new AppException(ErrorCode.PAYMENT_ALREADY_EXISTS,
                        "Đơn hàng đã được thanh toán",
                        HttpStatus.CONFLICT);
            }
            throw e;
        }
    }

    private boolean isDuplicateOrderPayment(DataIntegrityViolationException e) {
        Throwable t = e.getCause();
        while (t != null) {
            if (t instanceof ConstraintViolationException cve) {
                return "order_id".equals(cve.getConstraintName());
            }
            t = t.getCause();
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasSuccessfulPayment(Long orderId) {
        return paymentRepository.existsByOrderIdAndStatus(orderId, Payment.Status.SUCCESS);
    }

    private String generateTransactionCode() {
        String code;
        do {
            code = "PAY-" + LocalDateTime.now().format(CODE_DATETIME)
                    + "-" + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        } while (paymentRepository.existsByTransactionCode(code));
        return code;
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new AppException(ErrorCode.ORDER_NOT_FOUND,
                    "Không tìm thấy đơn hàng",
                    HttpStatus.NOT_FOUND);
        }
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND,
                        "Không tìm thấy giao dịch thanh toán",
                        HttpStatus.NOT_FOUND));
        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(Long orderId, PaymentConfirmRequest request) {
        if (request.getStatus() != Payment.Status.SUCCESS) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Chỉ chấp nhận xác nhận thanh toán thành công",
                    HttpStatus.BAD_REQUEST);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND,
                        "Không tìm thấy đơn hàng",
                        HttpStatus.NOT_FOUND));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND,
                        "Không tìm thấy giao dịch thanh toán",
                        HttpStatus.NOT_FOUND));

        if (payment.getStatus() != Payment.Status.PENDING) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED,
                    "Giao dịch thanh toán đã được xử lý",
                    HttpStatus.CONFLICT);
        }

        if (order.getStatus() != Order.Status.PENDING
                && order.getStatus() != Order.Status.CONFIRMED) {
            throw new AppException(ErrorCode.ORDER_NOT_EDITABLE,
                    "Đơn hàng đã đóng, không thể xác nhận thanh toán",
                    HttpStatus.CONFLICT);
        }

        payment.setStatus(Payment.Status.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        Payment saved = paymentRepository.save(payment);

        order.setStatus(Order.Status.COMPLETED);
        Order savedOrder = orderRepository.save(order);

        Long tableId = savedOrder.getTable().getId();
        if (orderRepository.countActiveByTableExcluding(tableId,
                List.of(savedOrder.getId())) == 0) {
            tableService.updateTableStatus(tableId,
                    new TableUpdateStatusRequest(Tables.Status.AVAILABLE));
        }

        return paymentMapper.toResponse(saved, savedOrder.getStatus().name());
    }
}
