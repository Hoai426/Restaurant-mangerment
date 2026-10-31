package restaurant_management_be.repository.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import restaurant_management_be.common.report.ReportFilterBuilder;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.entities.Order;
import restaurant_management_be.repository.ReportRepository.OrderStatisticsAggregate;
import restaurant_management_be.repository.ReportRepository.OrderValueRange;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderStatisticsReportQuery {

    private final EntityManager entityManager;
    private final ReportFilterBuilder reportFilterBuilder;

    public List<OrderStatisticsAggregate> execute(
            List<FilterCriteria> filters,
            List<OrderValueRange> valueRanges) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = criteriaBuilder.createQuery(Object[].class);
        Root<Order> root = query.from(Order.class);
        Expression<BigDecimal> amount = root.get("totalAmount");
        CriteriaBuilder.Case<String> valueRange = criteriaBuilder.selectCase();

        for (OrderValueRange range : valueRanges) {
            Predicate rangePredicate = criteriaBuilder.greaterThanOrEqualTo(amount, range.minAmount());
            if (range.maxAmountExclusive() != null) {
                rangePredicate = criteriaBuilder.and(
                        rangePredicate,
                        criteriaBuilder.lessThan(amount, range.maxAmountExclusive()));
            }
            valueRange.when(rangePredicate, range.label());
        }

        Expression<String> valueRangeExpression = valueRange.otherwise(
                valueRanges.get(valueRanges.size() - 1).label());
        query.multiselect(
                root.get("status"),
                valueRangeExpression,
                criteriaBuilder.countDistinct(root.get("id")),
                criteriaBuilder.sum(amount));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(criteriaBuilder.greaterThanOrEqualTo(amount, valueRanges.get(0).minAmount()));
        if (filters != null) {
            for (FilterCriteria filter : filters) {
                predicates.add(reportFilterBuilder.buildPredicate(criteriaBuilder, root, filter));
            }
        }
        query.where(predicates.toArray(new Predicate[0]));
        query.groupBy(root.get("status"), valueRangeExpression);

        return entityManager.createQuery(query).getResultList().stream()
                .map(row -> new OrderStatisticsAggregate(
                        (Order.Status) row[0],
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        (BigDecimal) row[3]))
                .toList();
    }
}
