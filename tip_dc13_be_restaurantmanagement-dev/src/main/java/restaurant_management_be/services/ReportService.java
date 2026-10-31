package restaurant_management_be.services;

import restaurant_management_be.dto.reports.ReportQueryRequest;
import restaurant_management_be.dto.reports.ReportResult;
import restaurant_management_be.dto.reports.DailyRevenueReportRequest;
import restaurant_management_be.dto.reports.DailyRevenueReportResponse;
import restaurant_management_be.dto.reports.OrderStatisticsRequest;
import restaurant_management_be.dto.reports.OrderStatisticsResponse;
import restaurant_management_be.dto.reports.OrderStatusChartRequest;
import restaurant_management_be.dto.reports.OrderStatusChartResponse;
import restaurant_management_be.dto.reports.DishSalesReportRequest;
import restaurant_management_be.dto.reports.DishSalesReportResponse;
import restaurant_management_be.dto.reports.TopSellingDishesRequest;
import restaurant_management_be.dto.reports.TopSellingDishesResponse;
import restaurant_management_be.dto.reports.PaymentStatisticsRequest;
import restaurant_management_be.dto.reports.PaymentStatisticsResponse;
import restaurant_management_be.dto.reports.OverviewStatisticsRequest;
import restaurant_management_be.dto.reports.OverviewStatisticsResponse;
import restaurant_management_be.dto.reports.RevenueReportRequest;
import restaurant_management_be.dto.reports.RevenueReportResponse;

public interface ReportService {

    RevenueReportResponse getRevenueReport(RevenueReportRequest request);

    ReportResult queryReport(ReportQueryRequest request);

    OrderStatisticsResponse getOrderStatistics(OrderStatisticsRequest request);

    OrderStatusChartResponse getOrderStatusChart(OrderStatusChartRequest request);

    DishSalesReportResponse getDishSalesReport(DishSalesReportRequest request);

    TopSellingDishesResponse getTopSellingDishes(TopSellingDishesRequest request);

    PaymentStatisticsResponse getPaymentStatistics(PaymentStatisticsRequest request);

    OverviewStatisticsResponse getOverviewStatistics(OverviewStatisticsRequest request);

    DailyRevenueReportResponse getDailyRevenueReport(DailyRevenueReportRequest request);
}
