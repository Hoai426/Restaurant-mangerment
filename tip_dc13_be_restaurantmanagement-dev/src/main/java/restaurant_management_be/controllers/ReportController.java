package restaurant_management_be.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import restaurant_management_be.common.response.SuccessResponse;
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
import restaurant_management_be.dto.reports.OrderStatisticsRequest;
import restaurant_management_be.dto.reports.OrderStatisticsResponse;
import restaurant_management_be.dto.reports.OrderStatusChartRequest;
import restaurant_management_be.dto.reports.OrderStatusChartResponse;
import restaurant_management_be.dto.reports.ReportQueryRequest;
import restaurant_management_be.dto.reports.ReportResult;
import restaurant_management_be.dto.reports.RevenueReportRequest;
import restaurant_management_be.dto.reports.RevenueReportResponse;
import restaurant_management_be.services.ReportService;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<RevenueReportResponse>> getRevenueReport(
            RevenueReportRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Lấy báo cáo doanh thu thành công",
                reportService.getRevenueReport(request)));
    }

    @PostMapping("/revenue/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<DailyRevenueReportResponse>> getDailyRevenueReport(
            @RequestBody DailyRevenueReportRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Lấy báo cáo doanh thu theo ngày thành công",
                reportService.getDailyRevenueReport(request)));
    }

    @PostMapping("/query")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<ReportResult>> queryReport(
            @RequestBody ReportQueryRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Truy vấn báo cáo thành công",
                reportService.queryReport(request)));
    }

    @PostMapping("/orders/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<OrderStatisticsResponse>> getOrderStatistics(
            @RequestBody OrderStatisticsRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Lấy thống kê đơn hàng thành công",
                reportService.getOrderStatistics(request)));
    }

    @PostMapping("/orders/status-chart")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<OrderStatusChartResponse>> getOrderStatusChart(
            @RequestBody OrderStatusChartRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Lấy thống kê đơn hàng theo trạng thái thành công",
                reportService.getOrderStatusChart(request)));
    }

    @GetMapping("/dishes/sales")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<DishSalesReportResponse>> getDishSalesReport(
            @Valid @ModelAttribute DishSalesReportRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Lấy báo cáo doanh số món ăn thành công",
                reportService.getDishSalesReport(request)));
    }

    @PostMapping("/dishes/top-selling")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<TopSellingDishesResponse>> getTopSellingDishes(
            @RequestBody TopSellingDishesRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Lấy top món ăn bán chạy thành công",
                reportService.getTopSellingDishes(request)));
    }

    @PostMapping("/payments/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<PaymentStatisticsResponse>> getPaymentStatistics(
            @RequestBody PaymentStatisticsRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Lấy thống kê thanh toán thành công",
                reportService.getPaymentStatistics(request)));
    }

    @PostMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SuccessResponse<OverviewStatisticsResponse>> getOverviewStatistics(
            @RequestBody OverviewStatisticsRequest request) {
        return ResponseEntity.ok(SuccessResponse.ok(
                "Lấy thống kê tổng quan thành công",
                reportService.getOverviewStatistics(request)));
    }
}
