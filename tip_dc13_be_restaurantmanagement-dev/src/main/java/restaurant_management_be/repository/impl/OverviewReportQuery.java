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
import restaurant_management_be.entities.Order;
import restaurant_management_be.entities.Payment;
import restaurant_management_be.entities.Reservation;
import restaurant_management_be.repository.ReportRepository.OverviewAggregate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class OverviewReportQuery {

    private final EntityManager entityManager;
    private final ReportFilterBuilder reportFilterBuilder;

    public OverviewAggregate execute(List<FilterCriteria> filters) {
        return new OverviewAggregate(
                sumSuccessfulPayments(filters),
                countOrders(filters),
                countReservations(filters));
    }

    private BigDecimal sumSuccessfulPayments(List<FilterCriteria> filters) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<BigDecimal> query = criteriaBuilder.createQuery(BigDecimal.class);
        Root<Payment> root = query.from(Payment.class);

        query.select(criteriaBuilder.sum(root.get("amount")));
        List<Predicate> predicates = buildPredicates(criteriaBuilder, root, filters);
        predicates.add(criteriaBuilder.equal(root.get("status"), Payment.Status.SUCCESS));
        query.where(predicates.toArray(new Predicate[0]));

        BigDecimal total = entityManager.createQuery(query).getSingleResult();
        return total == null ? BigDecimal.ZERO : total;
    }

    private long countOrders(List<FilterCriteria> filters) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = criteriaBuilder.createQuery(Long.class);
        Root<Order> root = query.from(Order.class);

        query.select(criteriaBuilder.countDistinct(root.get("id")));
        query.where(buildPredicates(criteriaBuilder, root, filters).toArray(new Predicate[0]));

        return entityManager.createQuery(query).getSingleResult();
    }

    private long countReservations(List<FilterCriteria> filters) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Long> query = criteriaBuilder.createQuery(Long.class);
        Root<Reservation> root = query.from(Reservation.class);

        query.select(criteriaBuilder.countDistinct(root.get("id")));
        query.where(buildPredicates(criteriaBuilder, root, filters).toArray(new Predicate[0]));

        return entityManager.createQuery(query).getSingleResult();
    }

    private List<Predicate> buildPredicates(CriteriaBuilder criteriaBuilder, Root<?> root,
            List<FilterCriteria> filters) {
        List<Predicate> predicates = new ArrayList<>();
        if (filters != null) {
            for (FilterCriteria filter : filters) {
                predicates.add(reportFilterBuilder.buildPredicate(criteriaBuilder, root, filter));
            }
        }
        return predicates;
    }
}
