package restaurant_management_be.repository.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import restaurant_management_be.common.report.ReportFilterBuilder;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.entities.Payment;
import restaurant_management_be.repository.ReportRepository.PaymentStatisticsAggregate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class PaymentStatisticsReportQuery {

    private final EntityManager entityManager;
    private final ReportFilterBuilder reportFilterBuilder;

    public List<PaymentStatisticsAggregate> execute(List<FilterCriteria> filters) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = criteriaBuilder.createQuery(Object[].class);
        Root<Payment> root = query.from(Payment.class);

        query.multiselect(
                root.get("paymentMethod"),
                root.get("status"),
                criteriaBuilder.countDistinct(root.get("id")),
                criteriaBuilder.sum(root.get("amount")));

        List<Predicate> predicates = new ArrayList<>();
        if (filters != null) {
            for (FilterCriteria filter : filters) {
                predicates.add(reportFilterBuilder.buildPredicate(criteriaBuilder, root, filter));
            }
        }
        query.where(predicates.toArray(new Predicate[0]));
        query.groupBy(root.get("paymentMethod"), root.get("status"));

        return entityManager.createQuery(query).getResultList().stream()
                .map(row -> new PaymentStatisticsAggregate(
                        (Payment.PaymentMethod) row[0],
                        (Payment.Status) row[1],
                        ((Number) row[2]).longValue(),
                        (BigDecimal) row[3]))
                .toList();
    }
}
