package restaurant_management_be.repository;

import restaurant_management_be.common.report.ReportQueryPlan;
import restaurant_management_be.common.report.ReportRange;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.dto.reports.ReportResult;
import restaurant_management_be.entities.Order;
import restaurant_management_be.entities.Payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.math.BigDecimal;
import java.util.List;

public interface ReportRepository {

    ReportResult execute(ReportQueryPlan plan);

    List<OrderStatisticsAggregate> aggregateOrderStatistics(
            List<FilterCriteria> filters,
            List<OrderValueRange> valueRanges);

    Page<DishSalesAggregate> aggregateDishSales(
            List<FilterCriteria> filters,
            String sortBy,
            Sort.Direction direction,
            Pageable pageable);

    List<PaymentStatisticsAggregate> aggregatePaymentStatistics(List<FilterCriteria> filters);

    OverviewAggregate aggregateOverview(List<FilterCriteria> filters);

    List<DailyRevenueAggregate> aggregateDailyRevenue(List<FilterCriteria> filters, ReportRange range);

    record OrderStatisticsAggregate(
            Order.Status status,
            String valueRange,
            long orderCount,
            BigDecimal totalValue) {
    }

    record OrderValueRange(String label, BigDecimal minAmount, BigDecimal maxAmountExclusive) {
    }

    record DishSalesAggregate(
            Long dishId,
            String dishName,
            long quantitySold,
            BigDecimal revenue) {
    }

    record PaymentStatisticsAggregate(
            Payment.PaymentMethod method,
            Payment.Status status,
            long paymentCount,
            BigDecimal totalAmount) {
    }

    record OverviewAggregate(
            BigDecimal totalRevenue,
            long totalOrders,
            long totalReservations) {
    }

    record DailyRevenueAggregate(
            String date,
            BigDecimal revenue,
            long orderCount) {
    }
}
