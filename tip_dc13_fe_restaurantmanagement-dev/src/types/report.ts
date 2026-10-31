import type { OrderStatus } from "@/types/order";
import type { PaymentMethod, PaymentStatus } from "@/types/payment";
import type { FilterCriteria } from "@/types/search";

/**
 * Định nghĩa các kiểu dữ liệu (DTO) cho Báo cáo Doanh thu (RM-224)
 * Khớp 100% với Backend API GET /api/reports/revenue
 */

export type ReportGroupBy = "HOUR" | "DAY" | "WEEK" | "MONTH";

export interface RevenueReportParams {
  startDate: string;
  endDate: string;
  groupBy?: ReportGroupBy;
}

export interface RevenueSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  cashAmount: number;
  cardAmount: number;
  qrAmount: number;
}

export interface RevenueTimelinePoint {
  period: string;
  revenue: number;
  orderCount: number;
  cashAmount: number;
  cardAmount: number;
  qrAmount: number;
}

export interface RevenueReportResponse {
  summary: RevenueSummary;
  timeline: RevenueTimelinePoint[];
}

/** DTOs for POST /api/reports/revenue/daily */
export interface DailyRevenueReportRequest {
  preset?: ReportDatePreset;
  startDate?: string;
  endDate?: string;
  filters?: FilterCriteria[];
}

export interface DailyRevenueReportSummary {
  totalRevenue: number;
  totalOrders: number;
  startDate: string;
  endDate: string;
}

export interface DailyRevenueReportPoint {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface DailyRevenueReportResponse {
  summary: DailyRevenueReportSummary;
  points: DailyRevenueReportPoint[];
}

export type ReportDatePreset = "TODAY" | "YESTERDAY" | "LAST_7_DAYS" | "THIS_MONTH";

/**
 * ========================================================
 * DTOs cho Thống kê đơn hàng (Order Statistics)
 * Khớp 100% với Backend POST /api/reports/orders/statistics
 * ========================================================
 */

export type OrderValueBucket =
  | "0-200000"
  | "200000-500000"
  | "500000-1000000"
  | "1000000+";

export interface OrderFilterCriteria {
  field: string;
  operation: "IN" | "GTE" | "LTE" | "EQ";
  value: string | string[];
}

export interface OrderStatisticsRequest {
  filters: OrderFilterCriteria[];
}

export interface OrderStatisticsSummary {
  totalOrders: number;
  totalValue: number;
}

export interface OrderStatusStatItem {
  status: OrderStatus;
  orderCount: number;
  totalValue: number;
}

export interface OrderValueRangeStatItem {
  range: OrderValueBucket | string;
  minAmount: number;
  maxAmountExclusive: number | null;
  orderCount: number;
  totalValue: number;
}

export interface OrderStatisticsData {
  summary: OrderStatisticsSummary;
  byStatus: OrderStatusStatItem[];
  byValueRange: OrderValueRangeStatItem[];
}

/**
 * DTOs cho báo cáo doanh số món ăn
 * Khớp với Backend API GET /api/reports/dishes/sales
 */
export type DishSalesSortBy = "QUANTITY_SOLD" | "REVENUE" | "DISH_NAME";
export type DishSalesSortDirection = "ASC" | "DESC";

export interface DishSalesReportParams {
  sortBy: DishSalesSortBy;
  direction: DishSalesSortDirection;
  page: number;
  size: number;
}

export interface DishSalesReportItem {
  dishId: number;
  dishName: string;
  quantitySold: number;
  revenue: number;
}

export interface DishSalesReportData {
  items: DishSalesReportItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sortBy: DishSalesSortBy;
  direction: DishSalesSortDirection;
}

/** DTOs cho POST /api/reports/dishes/top-selling */
export type TopSellingDishesRequest =
  | { limit: number }
  | { limit: number; preset: ReportDatePreset }
  | { limit: number; startDate: string; endDate: string };

export interface TopSellingDishItem {
  rank: number;
  dishId: number;
  dishName: string;
  quantitySold: number;
  revenue: number;
}

export interface TopSellingDishesData {
  startDate: string | null;
  endDate: string | null;
  items: TopSellingDishItem[];
}

/** DTOs for POST /api/reports/payments/statistics */

export type PaymentStatisticsFilterOperation =
  | "EQ"
  | "NE"
  | "GT"
  | "GTE"
  | "LT"
  | "LTE"
  | "LIKE"
  | "IN";

export type PaymentStatisticsFilterValue =
  | string
  | number
  | boolean
  | Array<string | number | boolean>
  | null;

export interface PaymentStatisticsFilter {
  field: string;
  value: PaymentStatisticsFilterValue;
  operation: PaymentStatisticsFilterOperation;
}

export interface PaymentStatisticsRequest {
  filters?: PaymentStatisticsFilter[];
}

export interface PaymentStatisticsSummary {
  totalPayments: number;
  totalAmount: number;
}

export interface PaymentStatisticsByMethod {
  method: PaymentMethod;
  paymentCount: number;
  totalAmount: number;
}

export interface PaymentStatisticsByStatus {
  status: PaymentStatus;
  paymentCount: number;
  totalAmount: number;
}

export interface PaymentStatisticsData {
  summary: PaymentStatisticsSummary;
  byMethod: PaymentStatisticsByMethod[];
  byStatus: PaymentStatisticsByStatus[];
}

/** DTOs for POST /api/reports/overview */

export type OverviewStatisticsFilterOperation = "GTE" | "LT";

export interface OverviewStatisticsFilter {
  field: "createdAt";
  value: string;
  operation: OverviewStatisticsFilterOperation;
}

export interface OverviewStatisticsRequest {
  filters: OverviewStatisticsFilter[];
}

export interface OverviewStatisticsData {
  totalRevenue: number;
  totalOrders: number;
  totalReservations: number;
}
