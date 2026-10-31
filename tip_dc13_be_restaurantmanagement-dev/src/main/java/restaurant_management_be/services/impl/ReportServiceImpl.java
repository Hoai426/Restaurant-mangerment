package restaurant_management_be.services.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.report.ReportMetric;
import restaurant_management_be.common.report.ReportQueryPlan;
import restaurant_management_be.common.report.ReportQueryValidator;
import restaurant_management_be.common.report.ReportRange;
import restaurant_management_be.common.report.ReportRangeResolver;
import restaurant_management_be.common.report.ReportTarget;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.common.specification.FilterOperation;
import restaurant_management_be.common.util.StringUtil;
import restaurant_management_be.dto.reports.DailyRevenueReportRequest;
import restaurant_management_be.dto.reports.DailyRevenueReportResponse;
import restaurant_management_be.dto.reports.DishSalesReportRequest;
import restaurant_management_be.dto.reports.DishSalesReportResponse;
import restaurant_management_be.dto.reports.TopSellingDishesRequest;
import restaurant_management_be.dto.reports.TopSellingDishesResponse;
import restaurant_management_be.dto.reports.PaymentStatisticsRequest;
import restaurant_management_be.dto.reports.PaymentStatisticsResponse;
import restaurant_management_be.dto.reports.OverviewStatisticsRequest;
import restaurant_management_be.dto.reports.OverviewStatisticsResponse;
import restaurant_management_be.dto.reports.ReportMetricRequest;
import restaurant_management_be.dto.reports.ReportQueryRequest;
import restaurant_management_be.dto.reports.ReportResult;
import restaurant_management_be.dto.reports.OrderStatisticsRequest;
import restaurant_management_be.dto.reports.OrderStatisticsResponse;
import restaurant_management_be.dto.reports.OrderStatusChartRequest;
import restaurant_management_be.dto.reports.OrderStatusChartResponse;
import restaurant_management_be.dto.reports.RevenueReportRequest;
import restaurant_management_be.dto.reports.RevenueReportResponse;
import restaurant_management_be.entities.Order;
import restaurant_management_be.entities.Payment;
import restaurant_management_be.repository.ReportRepository;
import restaurant_management_be.repository.ReportRepository.DailyRevenueAggregate;
import restaurant_management_be.repository.ReportRepository.DishSalesAggregate;
import restaurant_management_be.services.ReportService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final ReportRepository reportRepository;
    private final ReportQueryValidator reportQueryValidator;

    @Override
    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(RevenueReportRequest request) {
        ReportQueryRequest queryRequest = new ReportQueryRequest();
        queryRequest.setTarget(ReportTarget.PAYMENTS);
        queryRequest.setStartDate(request.getStartDate());
        queryRequest.setEndDate(request.getEndDate());
        queryRequest.setGroupBy(request.getGroupBy());
        queryRequest.setTimeField("paidAt");
        queryRequest.setGroupFields(List.of("paymentMethod"));
        queryRequest.setMetrics(List.of(
                new ReportMetricRequest(ReportMetric.SUM, "amount", "revenue"),
                new ReportMetricRequest(ReportMetric.COUNT_DISTINCT, "order.id", "orderCount")));
        List<FilterCriteria> filters = new ArrayList<>();
        filters.add(new FilterCriteria("status", Payment.Status.SUCCESS, FilterOperation.EQ));
        if (request.getFilters() != null) {
            filters.addAll(request.getFilters());
        }
        queryRequest.setFilters(filters);
        ReportResult report = executeReport(queryRequest);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalOrders = 0;
        BigDecimal cash = BigDecimal.ZERO;
        BigDecimal card = BigDecimal.ZERO;
        BigDecimal qr = BigDecimal.ZERO;
        Map<String, RevenueBucket> buckets = new LinkedHashMap<>();

        for (Map<String, Object> row : report.getRows()) {
            String period = String.valueOf(row.get("period"));
            Payment.PaymentMethod paymentMethod = Payment.PaymentMethod.valueOf(
                    String.valueOf(row.get("group_paymentMethod")));
            BigDecimal revenue = (BigDecimal) row.get("revenue");
            long orderCount = ((Number) row.get("orderCount")).longValue();
            RevenueBucket bucket = buckets.computeIfAbsent(period, ignored -> new RevenueBucket());
            bucket.orderCount += orderCount;
            bucket.revenue = bucket.revenue.add(revenue);
            totalRevenue = totalRevenue.add(revenue);
            totalOrders += orderCount;

            switch (paymentMethod) {
                case CASH -> {
                    bucket.cashAmount = bucket.cashAmount.add(revenue);
                    cash = cash.add(revenue);
                }
                case CARD -> {
                    bucket.cardAmount = bucket.cardAmount.add(revenue);
                    card = card.add(revenue);
                }
                case QR -> {
                    bucket.qrAmount = bucket.qrAmount.add(revenue);
                    qr = qr.add(revenue);
                }
            }
        }

        List<RevenueReportResponse.TimelinePoint> timeline = buckets.entrySet().stream()
                .map(entry -> new RevenueReportResponse.TimelinePoint(entry.getKey(),
                        entry.getValue().revenue, entry.getValue().orderCount,
                        entry.getValue().cashAmount, entry.getValue().cardAmount,
                        entry.getValue().qrAmount))
                .toList();

        BigDecimal averageOrderValue = totalOrders == 0 ? BigDecimal.ZERO
                : totalRevenue.divide(new BigDecimal(totalOrders), 2, RoundingMode.HALF_UP);

        return new RevenueReportResponse(new RevenueReportResponse.Summary(
                totalRevenue, totalOrders, averageOrderValue, cash, card, qr), timeline);
    }

    @Override
    @Transactional(readOnly = true)
    public ReportResult queryReport(ReportQueryRequest request) {
        return executeReport(request);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderStatisticsResponse getOrderStatistics(OrderStatisticsRequest request) {
        if (request == null) {
            throw new AppException(
                    ErrorCode.VALIDATION_FAILED,
                    "Request thống kê đơn hàng không được null",
                    HttpStatus.BAD_REQUEST);
        }
        List<FilterCriteria> filters = request.getFilters() == null
                ? List.of()
                : request.getFilters();
        return calculateOrderStatistics(filters);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderStatusChartResponse getOrderStatusChart(OrderStatusChartRequest request) {
        if (request == null) {
            throw new AppException(
                    ErrorCode.VALIDATION_FAILED,
                    "Request thống kê đơn hàng theo trạng thái không được null",
                    HttpStatus.BAD_REQUEST);
        }

        ReportRange range = ReportRangeResolver.resolve(
                request.getPreset(), request.getStartDate(), request.getEndDate(), "DAY");

        List<FilterCriteria> filters = new ArrayList<>();
        filters.add(new FilterCriteria("createdAt", range.getStart(), FilterOperation.GTE));
        filters.add(new FilterCriteria("createdAt", range.getEnd(), FilterOperation.LT));
        if (request.getFilters() != null) {
            filters.addAll(request.getFilters());
        }

        OrderStatisticsResponse statistics = calculateOrderStatistics(filters);
        List<OrderStatusChartResponse.StatusStatistics> byStatus = statistics.getByStatus().stream()
                .map(item -> new OrderStatusChartResponse.StatusStatistics(
                        item.getStatus(), item.getOrderCount(), item.getTotalValue()))
                .toList();

        LocalDate firstDay = range.getStart().toLocalDate();
        LocalDate lastDay = range.getEnd().minusDays(1).toLocalDate();
        return new OrderStatusChartResponse(
                new OrderStatusChartResponse.Summary(
                        statistics.getSummary().getTotalOrders(),
                        statistics.getSummary().getTotalValue(),
                        firstDay.toString(),
                        lastDay.toString()),
                byStatus);
    }

    private OrderStatisticsResponse calculateOrderStatistics(List<FilterCriteria> filters) {
        Map<Order.Status, MutableOrderStatistics> statusAggregates = new LinkedHashMap<>();
        for (Order.Status status : Order.Status.values()) {
            statusAggregates.put(status, new MutableOrderStatistics());
        }
        Map<String, MutableOrderStatistics> rangeAggregates = new LinkedHashMap<>();
        List<ReportRepository.OrderValueRange> ranges = List.of(
                new ReportRepository.OrderValueRange(
                        "0-200000", BigDecimal.ZERO, new BigDecimal("200000")),
                new ReportRepository.OrderValueRange(
                        "200000-500000", new BigDecimal("200000"), new BigDecimal("500000")),
                new ReportRepository.OrderValueRange(
                        "500000-1000000", new BigDecimal("500000"), new BigDecimal("1000000")),
                new ReportRepository.OrderValueRange(
                        "1000000+", new BigDecimal("1000000"), null));
        ranges.forEach(range -> rangeAggregates.put(range.label(), new MutableOrderStatistics()));

        long totalOrders = 0;
        BigDecimal totalValue = BigDecimal.ZERO;
        for (ReportRepository.OrderStatisticsAggregate aggregate
                : reportRepository.aggregateOrderStatistics(filters, ranges)) {
            MutableOrderStatistics statusTotals = statusAggregates.get(aggregate.status());
            statusTotals.add(aggregate.orderCount(), aggregate.totalValue());
            MutableOrderStatistics rangeTotals = rangeAggregates.get(aggregate.valueRange());
            rangeTotals.add(aggregate.orderCount(), aggregate.totalValue());
            totalOrders += aggregate.orderCount();
            totalValue = totalValue.add(aggregate.totalValue());
        }

        List<OrderStatisticsResponse.StatusStatistics> byStatus = resolveStatuses(filters).stream()
                .map(status -> {
                    MutableOrderStatistics totals = statusAggregates.get(status);
                    return new OrderStatisticsResponse.StatusStatistics(
                            status.name(), totals.orderCount, totals.totalValue);
                })
                .toList();
        List<OrderStatisticsResponse.ValueRangeStatistics> byValueRange = ranges.stream()
                .map(range -> {
                    MutableOrderStatistics totals = rangeAggregates.get(range.label());
                    return new OrderStatisticsResponse.ValueRangeStatistics(
                            range.label(), range.minAmount(), range.maxAmountExclusive(),
                            totals.orderCount, totals.totalValue);
                })
                .toList();

        return new OrderStatisticsResponse(
                new OrderStatisticsResponse.Summary(totalOrders, totalValue), byStatus, byValueRange);
    }

    @Override
    @Transactional(readOnly = true)
    public DishSalesReportResponse getDishSalesReport(DishSalesReportRequest request) {
        if (request == null) {
            throw invalidDishSalesRequest();
        }

        String sortBy = request.getSortBy() == null
                ? "REVENUE"
                : request.getSortBy().trim().toUpperCase(Locale.ROOT);
        String directionValue = request.getDirection() == null
                ? "DESC"
                : request.getDirection().trim().toUpperCase(Locale.ROOT);
        int page = request.getPage() == null ? 0 : request.getPage();
        int size = request.getSize() == null ? 20 : request.getSize();
        if (!List.of("QUANTITY_SOLD", "REVENUE", "DISH_NAME").contains(sortBy)
                || !List.of("ASC", "DESC").contains(directionValue)
                || page < 0
                || size < 1
                || size > 100
                || (long) page * size > Integer.MAX_VALUE) {
            throw invalidDishSalesRequest();
        }

        Sort.Direction direction = Sort.Direction.valueOf(directionValue);
        List<FilterCriteria> filters = List.of(new FilterCriteria(
                "order.status", Order.Status.COMPLETED, FilterOperation.EQ));
        Page<DishSalesAggregate> result = reportRepository.aggregateDishSales(
                filters, sortBy, direction, PageRequest.of(page, size));

        List<DishSalesReportResponse.Item> items = result.getContent().stream()
                .map(row -> new DishSalesReportResponse.Item(
                        row.dishId(), row.dishName(), row.quantitySold(), row.revenue()))
                .toList();

        return new DishSalesReportResponse(
                items,
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                sortBy,
                direction.name());
    }

    @Override
    @Transactional(readOnly = true)
    public TopSellingDishesResponse getTopSellingDishes(TopSellingDishesRequest request) {
        if (request == null) {
            throw invalidDishSalesRequest();
        }

        int limit = request.getLimit() == null ? 5 : request.getLimit();
        if (limit < 1 || limit > 20) {
            throw invalidDishSalesRequest();
        }

        boolean hasRange = !StringUtil.isBlank(request.getPreset())
                || !StringUtil.isBlank(request.getStartDate())
                || !StringUtil.isBlank(request.getEndDate());
        ReportRange range = hasRange
                ? ReportRangeResolver.resolve(
                        request.getPreset(), request.getStartDate(), request.getEndDate(), "DAY")
                : null;

        List<FilterCriteria> filters = new ArrayList<>();
        filters.add(new FilterCriteria("order.status", Order.Status.COMPLETED, FilterOperation.EQ));
        if (range != null) {
            filters.add(new FilterCriteria("order.createdAt", range.getStart(), FilterOperation.GTE));
            filters.add(new FilterCriteria("order.createdAt", range.getEnd(), FilterOperation.LT));
        }

        Page<DishSalesAggregate> result = reportRepository.aggregateDishSales(
                filters, "QUANTITY_SOLD", Sort.Direction.DESC, PageRequest.of(0, limit));

        List<TopSellingDishesResponse.Item> items = new ArrayList<>();
        int rank = 1;
        for (DishSalesAggregate row : result.getContent()) {
            items.add(new TopSellingDishesResponse.Item(
                    rank++, row.dishId(), row.dishName(), row.quantitySold(), row.revenue()));
        }

        String startDate = null;
        String endDate = null;
        if (range != null) {
            startDate = range.getStart().toLocalDate().toString();
            endDate = range.getEnd().minusDays(1).toLocalDate().toString();
        }

        return new TopSellingDishesResponse(startDate, endDate, items);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentStatisticsResponse getPaymentStatistics(PaymentStatisticsRequest request) {
        if (request == null) {
            throw new AppException(
                    ErrorCode.VALIDATION_FAILED,
                    "Request thống kê thanh toán không được null",
                    HttpStatus.BAD_REQUEST);
        }
        List<FilterCriteria> filters = request.getFilters() == null
                ? List.of()
                : request.getFilters();
        Map<Payment.PaymentMethod, MutablePaymentStatistics> methodAggregates = new LinkedHashMap<>();
        for (Payment.PaymentMethod method : Payment.PaymentMethod.values()) {
            methodAggregates.put(method, new MutablePaymentStatistics());
        }
        Map<Payment.Status, MutablePaymentStatistics> statusAggregates = new LinkedHashMap<>();
        for (Payment.Status status : Payment.Status.values()) {
            statusAggregates.put(status, new MutablePaymentStatistics());
        }

        long totalPayments = 0;
        BigDecimal totalAmount = BigDecimal.ZERO;
        for (ReportRepository.PaymentStatisticsAggregate aggregate
                : reportRepository.aggregatePaymentStatistics(filters)) {
            MutablePaymentStatistics methodTotals = methodAggregates.get(aggregate.method());
            methodTotals.add(aggregate.paymentCount(), aggregate.totalAmount());
            MutablePaymentStatistics statusTotals = statusAggregates.get(aggregate.status());
            statusTotals.add(aggregate.paymentCount(), aggregate.totalAmount());
            totalPayments += aggregate.paymentCount();
            totalAmount = totalAmount.add(aggregate.totalAmount());
        }

        List<PaymentStatisticsResponse.MethodStatistics> byMethod = methodAggregates.entrySet().stream()
                .map(entry -> new PaymentStatisticsResponse.MethodStatistics(
                        entry.getKey().name(),
                        entry.getValue().paymentCount,
                        entry.getValue().totalAmount))
                .toList();
        List<PaymentStatisticsResponse.StatusStatistics> byStatus = statusAggregates.entrySet().stream()
                .map(entry -> new PaymentStatisticsResponse.StatusStatistics(
                        entry.getKey().name(),
                        entry.getValue().paymentCount,
                        entry.getValue().totalAmount))
                .toList();

        return new PaymentStatisticsResponse(
                new PaymentStatisticsResponse.Summary(totalPayments, totalAmount),
                byMethod,
                byStatus);
    }

    @Override
    @Transactional(readOnly = true)
    public OverviewStatisticsResponse getOverviewStatistics(OverviewStatisticsRequest request) {
        if (request == null) {
            throw new AppException(
                    ErrorCode.VALIDATION_FAILED,
                    "Request thống kê tổng quan không được null",
                    HttpStatus.BAD_REQUEST);
        }
        List<FilterCriteria> filters = request.getFilters() == null
                ? List.of()
                : request.getFilters();
        ReportRepository.OverviewAggregate aggregate = reportRepository.aggregateOverview(filters);
        return new OverviewStatisticsResponse(
                aggregate.totalRevenue(),
                aggregate.totalOrders(),
                aggregate.totalReservations());
    }

    @Override
    @Transactional(readOnly = true)
    public DailyRevenueReportResponse getDailyRevenueReport(DailyRevenueReportRequest request) {
        ReportRange range = ReportRangeResolver.resolve(
                request.getPreset(), request.getStartDate(), request.getEndDate(), "DAY");

        List<FilterCriteria> filters = new ArrayList<>();
        filters.add(new FilterCriteria("status", Payment.Status.SUCCESS, FilterOperation.EQ));
        if (request.getFilters() != null) {
            filters.addAll(request.getFilters());
        }
        List<DailyRevenueAggregate> aggregates = reportRepository.aggregateDailyRevenue(filters, range);

        Map<String, DailyRevenueAggregate> aggregatesByDate = new LinkedHashMap<>();
        for (DailyRevenueAggregate aggregate : aggregates) {
            aggregatesByDate.put(aggregate.date(), aggregate);
        }

        LocalDate firstDay = range.getStart().toLocalDate();
        LocalDate lastDay = range.getEnd().minusDays(1).toLocalDate();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        long totalOrders = 0;
        List<DailyRevenueReportResponse.DailyPoint> points = new ArrayList<>();
        for (LocalDate day = firstDay; !day.isAfter(lastDay); day = day.plusDays(1)) {
            DailyRevenueAggregate aggregate = aggregatesByDate.get(day.toString());
            BigDecimal revenue = aggregate == null ? BigDecimal.ZERO : aggregate.revenue();
            long orderCount = aggregate == null ? 0 : aggregate.orderCount();
            points.add(new DailyRevenueReportResponse.DailyPoint(day.toString(), revenue, orderCount));
            totalRevenue = totalRevenue.add(revenue);
            totalOrders += orderCount;
        }

        return new DailyRevenueReportResponse(
                new DailyRevenueReportResponse.Summary(
                        totalRevenue, totalOrders, firstDay.toString(), lastDay.toString()),
                points);
    }

    private AppException invalidDishSalesRequest() {
        return new AppException(
                ErrorCode.VALIDATION_FAILED,
                "Tham số báo cáo món ăn không hợp lệ",
                HttpStatus.BAD_REQUEST);
    }

    private List<Order.Status> resolveStatuses(List<FilterCriteria> filters) {
        List<FilterCriteria> statusFilters = filters.stream()
                .filter(Objects::nonNull)
                .filter(filter -> "status".equalsIgnoreCase(filter.getField()))
                .toList();
        if (statusFilters.isEmpty()) {
            return List.of(Order.Status.values());
        }

        return List.of(Order.Status.values()).stream()
                .filter(status -> statusFilters.stream().allMatch(filter -> matchesStatusFilter(status, filter)))
                .toList();
    }

    private boolean matchesStatusFilter(Order.Status status, FilterCriteria filter) {
        FilterOperation operation = filter.getOperation() == null
                ? FilterOperation.EQ
                : filter.getOperation();
        Object value = filter.getValue();
        if (value == null) {
            return operation == FilterOperation.NE;
        }
        if (operation == FilterOperation.IN) {
            return value instanceof Collection<?> values
                    && values.stream().anyMatch(item -> status == toOrderStatus(item));
        }

        Order.Status expected = toOrderStatus(value);
        int comparison = status.compareTo(expected);
        return switch (operation) {
            case EQ -> comparison == 0;
            case NE -> comparison != 0;
            case GT -> comparison > 0;
            case GTE -> comparison >= 0;
            case LT -> comparison < 0;
            case LTE -> comparison <= 0;
            case LIKE, IN -> false;
        };
    }

    private Order.Status toOrderStatus(Object value) {
        if (value instanceof Order.Status status) {
            return status;
        }
        return Order.Status.valueOf(String.valueOf(value).trim().toUpperCase(Locale.ROOT));
    }

    private ReportResult executeReport(ReportQueryRequest request) {
        ReportQueryPlan plan = reportQueryValidator.createPlan(request);
        return reportRepository.execute(plan);
    }

    private static class RevenueBucket {
        private BigDecimal revenue = BigDecimal.ZERO;
        private long orderCount;
        private BigDecimal cashAmount = BigDecimal.ZERO;
        private BigDecimal cardAmount = BigDecimal.ZERO;
        private BigDecimal qrAmount = BigDecimal.ZERO;
    }

    private static class MutableOrderStatistics {
        private long orderCount;
        private BigDecimal totalValue = BigDecimal.ZERO;

        private void add(long count, BigDecimal value) {
            orderCount += count;
            totalValue = totalValue.add(value);
        }
    }

    private static class MutablePaymentStatistics {
        private long paymentCount;
        private BigDecimal totalAmount = BigDecimal.ZERO;

        private void add(long count, BigDecimal amount) {
            paymentCount += count;
            totalAmount = totalAmount.add(amount);
        }
    }
}
