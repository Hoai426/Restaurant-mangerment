package restaurant_management_be.repository.impl;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import restaurant_management_be.common.report.ReportFilterBuilder;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.entities.OrderItem;
import restaurant_management_be.repository.ReportRepository.DishSalesAggregate;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DishSalesReportQuery {

    private final EntityManager entityManager;
    private final ReportFilterBuilder reportFilterBuilder;

    public Page<DishSalesAggregate> execute(
            List<FilterCriteria> filters,
            String sortBy,
            Sort.Direction direction,
            Pageable pageable) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = criteriaBuilder.createQuery(Object[].class);
        Root<OrderItem> root = query.from(OrderItem.class);

        Path<Long> dishId = root.get("dish").get("id");
        Path<String> dishName = root.get("dish").get("name");
        Expression<Long> quantitySold = criteriaBuilder.sumAsLong(root.<Integer>get("quantity"));
        Expression<BigDecimal> revenue = criteriaBuilder.sum(root.<BigDecimal>get("subtotal"));

        query.multiselect(dishId, dishName, quantitySold, revenue)
                .where(buildPredicates(criteriaBuilder, root, filters))
                .groupBy(dishId, dishName);

        Expression<?> sortExpression = switch (sortBy) {
            case "QUANTITY_SOLD" -> quantitySold;
            case "DISH_NAME" -> criteriaBuilder.lower(dishName);
            default -> revenue;
        };
        query.orderBy(
                direction.isAscending()
                        ? criteriaBuilder.asc(sortExpression)
                        : criteriaBuilder.desc(sortExpression),
                criteriaBuilder.asc(dishId));

        List<DishSalesAggregate> items = entityManager.createQuery(query)
                .setFirstResult(Math.toIntExact(pageable.getOffset()))
                .setMaxResults(pageable.getPageSize())
                .getResultList()
                .stream()
                .map(row -> new DishSalesAggregate(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        (BigDecimal) row[3]))
                .toList();

        CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
        Root<OrderItem> countRoot = countQuery.from(OrderItem.class);
        countQuery.select(criteriaBuilder.countDistinct(countRoot.get("dish").get("id")))
                .where(buildPredicates(criteriaBuilder, countRoot, filters));

        long total = entityManager.createQuery(countQuery).getSingleResult();
        return new PageImpl<>(items, pageable, total);
    }

    private Predicate[] buildPredicates(
            CriteriaBuilder criteriaBuilder,
            Root<?> root,
            List<FilterCriteria> filters) {
        return filters.stream()
                .map(filter -> reportFilterBuilder.buildPredicate(criteriaBuilder, root, filter))
                .toArray(Predicate[]::new);
    }
}
