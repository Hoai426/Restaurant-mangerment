package restaurant_management_be.common.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;

import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public class GenericSpecification<T> implements Specification<T> {

    private final List<FilterCriteria> filters;

    public GenericSpecification(List<FilterCriteria> filters) {
        this.filters = filters;
    }

    @Override
    public Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder builder) {
        if (filters == null || filters.isEmpty()) {
            return builder.conjunction();
        }

        query.distinct(true);

        List<Predicate> predicates = new ArrayList<>();
        for (FilterCriteria criteria : filters) {
            if (criteria.getField() == null || criteria.getValue() == null) {
                continue;
            }
            predicates.add(buildPredicate(root, criteria, builder));
        }

        return builder.and(predicates.toArray(new Predicate[0]));
    }

    private Predicate buildPredicate(Root<T> root, FilterCriteria criteria, CriteriaBuilder builder) {
        Path<Object> path = resolvePath(root, criteria.getField());
        FilterOperation operation = criteria.getOperation() == null
                ? FilterOperation.EQ
                : criteria.getOperation();

        switch (operation) {
            case LIKE:
                return builder.like(
                        builder.lower(path.as(String.class)),
                        "%" + String.valueOf(criteria.getValue()).toLowerCase() + "%");
            case IN:
                if (criteria.getValue() instanceof java.util.Collection<?> col) {
                    return path.in(col);
                }
                throw new AppException(ErrorCode.VALIDATION_FAILED,
                        "Giá trị cho phép toán IN phải là danh sách",
                        HttpStatus.BAD_REQUEST);
            case NE:
                return builder.notEqual(path, criteria.getValue());
            case GT:
                return builder.greaterThan(comparable(path), comparableValue(criteria.getValue()));
            case GTE:
                return builder.greaterThanOrEqualTo(comparable(path), comparableValue(criteria.getValue()));
            case LT:
                return builder.lessThan(comparable(path), comparableValue(criteria.getValue()));
            case LTE:
                return builder.lessThanOrEqualTo(comparable(path), comparableValue(criteria.getValue()));
            default:
                return builder.equal(path, criteria.getValue());
        }
    }

    @SuppressWarnings("rawtypes")
    private Comparable comparableValue(Object value) {
        if (value instanceof Number) {
            return (Comparable) value;
        }
        try {
            return new java.math.BigDecimal(String.valueOf(value));
        } catch (NumberFormatException e) {
            throw new AppException(ErrorCode.VALIDATION_FAILED,
                    "Giá trị lọc không hợp lệ cho phép so sánh: " + value,
                    HttpStatus.BAD_REQUEST);
        }
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private Expression<Comparable> comparable(Path<Object> path) {
        return (Expression) path;
    }

    @SuppressWarnings("unchecked")
    private Path<Object> resolvePath(Root<T> root, String field) {
        if (field.contains(".")) {
            String[] parts = field.split("\\.");
            return (Path<Object>) root.join(parts[0]).get(parts[1]);
        }
        return root.get(field);
    }
}
