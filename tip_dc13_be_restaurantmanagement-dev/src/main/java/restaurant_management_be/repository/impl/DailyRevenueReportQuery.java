package restaurant_management_be.repository.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import restaurant_management_be.common.report.ReportFilterBuilder;
import restaurant_management_be.common.report.ReportGroupBy;
import restaurant_management_be.common.report.ReportRange;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.entities.Payment;
import restaurant_management_be.repository.ReportRepository.DailyRevenueAggregate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DailyRevenueReportQuery {

    private final EntityManager entityManager;
    private final ReportFilterBuilder reportFilterBuilder;

    public List<DailyRevenueAggregate> execute(List<FilterCriteria> filters, ReportRange range) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = criteriaBuilder.createQuery(Object[].class);
        Root<Payment> root = query.from(Payment.class);
        Path<LocalDateTime> paidAt = root.get("paidAt");

        Expression<String> dayBucket = criteriaBuilder.function("DATE_FORMAT", String.class,
                paidAt, criteriaBuilder.literal(ReportGroupBy.DAY.dateFormat()));
        query.multiselect(
                dayBucket,
                criteriaBuilder.sum(root.get("amount")),
                criteriaBuilder.countDistinct(root.get("id")));

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(criteriaBuilder.greaterThanOrEqualTo(paidAt, range.getStart()));
        predicates.add(criteriaBuilder.lessThan(paidAt, range.getEnd()));
        if (filters != null) {
            for (FilterCriteria filter : filters) {
                predicates.add(reportFilterBuilder.buildPredicate(criteriaBuilder, root, filter));
            }
        }
        query.where(predicates.toArray(new Predicate[0]));
        query.groupBy(dayBucket);

        return entityManager.createQuery(query).getResultList().stream()
                .map(row -> new DailyRevenueAggregate(
                        (String) row[0],
                        row[1] == null ? BigDecimal.ZERO : (BigDecimal) row[1],
                        ((Number) row[2]).longValue()))
                .toList();
    }
}
