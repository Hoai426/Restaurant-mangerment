package restaurant_management_be.repository.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Selection;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Repository;

import restaurant_management_be.common.report.ReportFilterBuilder;
import restaurant_management_be.common.report.ReportMetric;
import restaurant_management_be.common.report.ReportRange;
import restaurant_management_be.common.report.ReportQueryPlan;
import restaurant_management_be.common.report.ReportTarget;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.dto.reports.ReportMetricRequest;
import restaurant_management_be.dto.reports.ReportResult;
import restaurant_management_be.repository.ReportRepository;
import restaurant_management_be.repository.ReportRepository.DailyRevenueAggregate;
import restaurant_management_be.repository.ReportRepository.DishSalesAggregate;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class ReportRepositoryImpl implements ReportRepository {
    private final EntityManager entityManager;
    private final ReportFilterBuilder reportFilterBuilder;
    private final OrderStatisticsReportQuery orderStatisticsReportQuery;
    private final DishSalesReportQuery dishSalesReportQuery;
    private final PaymentStatisticsReportQuery paymentStatisticsReportQuery;
    private final OverviewReportQuery overviewReportQuery;
    private final DailyRevenueReportQuery dailyRevenueReportQuery;

    @Override
    public ReportResult execute(ReportQueryPlan plan) {
        ReportTarget target = plan.target();
        ReportRange range = plan.range();
        String timeField = plan.timeField();
        List<String> groupFields = plan.groupFields();
        List<String> metricAliases = plan.metrics().stream().map(ReportMetricRequest::getAlias).toList();

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> cq = cb.createQuery(Object[].class);
        Root<?> root = cq.from(target.entityClass());

        List<Selection<?>> selections = new ArrayList<>();
        Map<String, Expression<?>> selectionsByAlias = new LinkedHashMap<>();
        List<Expression<?>> groupExprs = new ArrayList<>();

        if (range.getGroupBy() != null) {
            Expression<?> periodExpr = cb.function("DATE_FORMAT", String.class,
                    reportFilterBuilder.resolveScalarPath(root, timeField),
                    cb.literal(range.getGroupBy().dateFormat()));
            selections.add(periodExpr.alias("period"));
            selectionsByAlias.put("period", periodExpr);
            groupExprs.add(periodExpr);
        }

        for (String gf : groupFields) {
            Expression<?> gExpr = reportFilterBuilder.resolveScalarPath(root, gf);
            selections.add(gExpr.alias("group_" + gf.replace('.', '_')));
            selectionsByAlias.put("group_" + gf.replace('.', '_'), gExpr);
            groupExprs.add(gExpr);
        }

        for (ReportMetricRequest metric : plan.metrics()) {
            Expression<?> fieldExpr = reportFilterBuilder.resolveScalarPath(root, metric.getField());
            Expression<?> aggExpr = buildAggregate(cb, metric.getOp(), fieldExpr);
            selections.add(aggExpr.alias(metric.getAlias()));
            selectionsByAlias.put(metric.getAlias(), aggExpr);
        }

        List<Predicate> predicates = new ArrayList<>();
        Expression<?> timeExpr = reportFilterBuilder.resolveScalarPath(root, timeField);
        appendTimeRange(predicates, cb, timeExpr, range);
        for (FilterCriteria filter : plan.filters()) {
            predicates.add(reportFilterBuilder.buildPredicate(cb, root, filter));
        }

        cq.multiselect(selections);
        cq.where(predicates.toArray(new Predicate[0]));
        if (!groupExprs.isEmpty()) {
            cq.groupBy(groupExprs);
        }
        applyOrder(cq, cb, selectionsByAlias, metricAliases, plan.topN());
        if ((plan.topN() == null || plan.topN() <= 0) && !groupExprs.isEmpty()) {
            cq.orderBy(groupExprs.stream().map(cb::asc).toList());
        }

        var query = entityManager.createQuery(cq);
        if (plan.topN() != null && plan.topN() > 0) {
            query.setMaxResults(plan.topN());
        }
        List<Object[]> resultList = query.getResultList();

        List<Map<String, Object>> rows = new ArrayList<>();
        List<String> keys = new ArrayList<>(selectionsByAlias.keySet());
        for (Object[] row : resultList) {
            Map<String, Object> map = new LinkedHashMap<>();
            for (int i = 0; i < keys.size() && i < row.length; i++) {
                map.put(keys.get(i), row[i]);
            }
            rows.add(map);
        }

        return new ReportResult(rows, rows.size());
    }

    @Override
    public List<OrderStatisticsAggregate> aggregateOrderStatistics(
            List<FilterCriteria> filters,
            List<OrderValueRange> valueRanges) {
        return orderStatisticsReportQuery.execute(filters, valueRanges);
    }

    @Override
    public Page<DishSalesAggregate> aggregateDishSales(
            List<FilterCriteria> filters,
            String sortBy,
            Sort.Direction direction,
            Pageable pageable) {
        return dishSalesReportQuery.execute(filters, sortBy, direction, pageable);
    }

    @Override
    public List<PaymentStatisticsAggregate> aggregatePaymentStatistics(List<FilterCriteria> filters) {
        return paymentStatisticsReportQuery.execute(filters);
    }

    @Override
    public OverviewAggregate aggregateOverview(List<FilterCriteria> filters) {
        return overviewReportQuery.execute(filters);
    }

    @Override
    public List<DailyRevenueAggregate> aggregateDailyRevenue(List<FilterCriteria> filters, ReportRange range) {
        return dailyRevenueReportQuery.execute(filters, range);
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private void appendTimeRange(List<Predicate> predicates, CriteriaBuilder cb, Expression<?> timeExpr,
            ReportRange range) {
        predicates.add(cb.greaterThanOrEqualTo((Expression) timeExpr, (Comparable) range.getStart()));
        predicates.add(cb.lessThan((Expression) timeExpr, (Comparable) range.getEnd()));
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private Expression buildAggregate(CriteriaBuilder cb, ReportMetric op, Expression<?> fieldExpr) {
        return switch (op) {
            case SUM -> cb.sum((Expression<? extends Number>) fieldExpr);
            case AVG -> cb.avg((Expression<? extends Number>) fieldExpr);
            case COUNT -> cb.count(fieldExpr);
            case COUNT_DISTINCT -> cb.countDistinct(fieldExpr);
            case MIN -> cb.min((Expression<? extends Number>) fieldExpr);
            case MAX -> cb.max((Expression<? extends Number>) fieldExpr);
        };
    }

    @SuppressWarnings("rawtypes")
    private void applyOrder(CriteriaQuery<Object[]> cq, CriteriaBuilder cb,
            Map<String, Expression<?>> selectionsByAlias, List<String> metricAliases,
            Integer topN) {
        if (topN != null && topN > 0 && !metricAliases.isEmpty()) {
            Expression agg = selectionsByAlias.get(metricAliases.get(0));
            if (agg != null) {
                cq.orderBy(cb.desc(agg));
            }
        }
    }
}
