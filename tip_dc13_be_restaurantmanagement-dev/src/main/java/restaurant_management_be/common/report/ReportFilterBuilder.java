package restaurant_management_be.common.report;

import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.metamodel.Attribute;
import jakarta.persistence.metamodel.ManagedType;
import jakarta.persistence.metamodel.PluralAttribute;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import restaurant_management_be.common.exception.AppException;
import restaurant_management_be.common.exception.ErrorCode;
import restaurant_management_be.common.specification.FilterCriteria;
import restaurant_management_be.common.specification.FilterOperation;
import restaurant_management_be.entities.User;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ReportFilterBuilder {

    private static final Set<String> SENSITIVE_USER_FIELDS = Set.of(
            "passwordHash", "username", "fullName", "email", "phone", "emailVerified", "emailVerifiedAt");

    private final EntityManager entityManager;

    public Predicate buildPredicate(CriteriaBuilder criteriaBuilder, Root<?> root, FilterCriteria filter) {
        if (filter == null) {
            throw invalidFilter("Filter không được null");
        }

        Path<?> path = resolveScalarPath(root, filter.getField());
        FilterOperation operation = filter.getOperation() == null
                ? FilterOperation.EQ
                : filter.getOperation();
        Object value = filter.getValue();

        if (value == null) {
            if (operation == FilterOperation.EQ) {
                return path.isNull();
            }
            if (operation == FilterOperation.NE) {
                return path.isNotNull();
            }
            throw invalidFilter("Toán tử " + operation + " không hỗ trợ giá trị null");
        }

        return switch (operation) {
            case EQ -> criteriaBuilder.equal(path, convertValue(value, path.getJavaType()));
            case NE -> criteriaBuilder.notEqual(path, convertValue(value, path.getJavaType()));
            case LIKE -> buildLike(criteriaBuilder, path, value);
            case IN -> buildIn(path, value);
            case GT -> buildComparison(criteriaBuilder, path, value, Comparison.GREATER_THAN);
            case GTE -> buildComparison(criteriaBuilder, path, value, Comparison.GREATER_THAN_OR_EQUAL);
            case LT -> buildComparison(criteriaBuilder, path, value, Comparison.LESS_THAN);
            case LTE -> buildComparison(criteriaBuilder, path, value, Comparison.LESS_THAN_OR_EQUAL);
        };
    }

    public Path<?> resolvePath(Root<?> root, String field) {
        if (field == null || field.isBlank()) {
            throw invalidFilter("Field filter không được để trống");
        }

        String[] parts = field.trim().split("\\.", -1);
        Path<?> path = root;
        ManagedType<?> managedType = entityManager.getMetamodel().managedType(root.getJavaType());

        for (int index = 0; index < parts.length; index++) {
            String part = parts[index].trim();
            if (part.isEmpty()) {
                throw invalidFilter("Field filter không hợp lệ: " + field);
            }
            if (managedType.getJavaType() == User.class && SENSITIVE_USER_FIELDS.contains(part)) {
                throw invalidFilter("Không được phép dùng field User này trong báo cáo: " + part);
            }

            Attribute<?, ?> attribute;
            try {
                attribute = managedType.getAttribute(part);
            } catch (IllegalArgumentException exception) {
                throw invalidFilter("Field report không tồn tại: " + field);
            }

            if (attribute instanceof PluralAttribute<?, ?, ?>) {
                throw invalidFilter("Không hỗ trợ đi qua collection trong field report: " + field);
            }

            path = path.get(part);
            if (index < parts.length - 1) {
                try {
                    managedType = entityManager.getMetamodel().managedType(attribute.getJavaType());
                } catch (IllegalArgumentException exception) {
                    throw invalidFilter("Không thể đi tiếp từ field report: " + part);
                }
            }
        }

        return path;
    }

    public Path<?> resolveScalarPath(Root<?> root, String field) {
        Path<?> path = resolvePath(root, field);
        if (!isScalarType(path.getJavaType())) {
            throw invalidFilter("Report chỉ hỗ trợ field scalar: " + field);
        }
        return path;
    }

    private Predicate buildLike(CriteriaBuilder criteriaBuilder, Path<?> path, Object value) {
        if (!CharSequence.class.isAssignableFrom(path.getJavaType())) {
            throw invalidFilter("Toán tử LIKE chỉ dùng được với field kiểu chuỗi");
        }

        String text = String.valueOf(convertValue(value, path.getJavaType()));
        return criteriaBuilder.like(criteriaBuilder.lower(path.as(String.class)),
                "%" + text.toLowerCase(Locale.ROOT) + "%");
    }

    private Predicate buildIn(Path<?> path, Object value) {
        if (!(value instanceof Collection<?> values) || values.isEmpty()) {
            throw invalidFilter("Giá trị cho phép toán IN phải là danh sách không rỗng");
        }

        return path.in(values.stream()
                .map(item -> {
                    if (item == null) {
                        throw invalidFilter("Danh sách IN không được chứa giá trị null");
                    }
                    return convertValue(item, path.getJavaType());
                })
                .toList());
    }

    @SuppressWarnings({ "rawtypes", "unchecked" })
    private Predicate buildComparison(CriteriaBuilder criteriaBuilder, Path<?> path,
            Object value, Comparison comparison) {
        Class<?> javaType = wrapPrimitive(path.getJavaType());
        if (!Comparable.class.isAssignableFrom(javaType)) {
            throw invalidFilter("Field không hỗ trợ phép so sánh");
        }

        Comparable converted = (Comparable) convertValue(value, javaType);
        Expression<? extends Comparable> expression = (Expression<? extends Comparable>) path;
        return switch (comparison) {
            case GREATER_THAN -> criteriaBuilder.greaterThan(expression, converted);
            case GREATER_THAN_OR_EQUAL -> criteriaBuilder.greaterThanOrEqualTo(expression, converted);
            case LESS_THAN -> criteriaBuilder.lessThan(expression, converted);
            case LESS_THAN_OR_EQUAL -> criteriaBuilder.lessThanOrEqualTo(expression, converted);
        };
    }

    private Object convertValue(Object value, Class<?> targetType) {
        Class<?> type = wrapPrimitive(targetType);
        if (type.isInstance(value)) {
            return value;
        }

        String text = String.valueOf(value).trim();
        try {
            if (type == String.class) {
                return text;
            }
            if (type.isEnum()) {
                return Enum.valueOf((Class<? extends Enum>) type, text.toUpperCase(Locale.ROOT));
            }
            if (Number.class.isAssignableFrom(type)) {
                return convertNumber(text, type);
            }
            if (type == Boolean.class) {
                if ("true".equalsIgnoreCase(text)) {
                    return true;
                }
                if ("false".equalsIgnoreCase(text)) {
                    return false;
                }
                throw new IllegalArgumentException("Invalid boolean");
            }
            if (type == Character.class && text.length() == 1) {
                return text.charAt(0);
            }
            if (type == LocalDate.class) {
                return LocalDate.parse(text);
            }
            if (type == LocalDateTime.class) {
                return LocalDateTime.parse(text);
            }
            if (type == LocalTime.class) {
                return LocalTime.parse(text);
            }
            if (type == OffsetDateTime.class) {
                return OffsetDateTime.parse(text);
            }
            if (type == ZonedDateTime.class) {
                return ZonedDateTime.parse(text);
            }
            if (type == Instant.class) {
                return Instant.parse(text);
            }
            if (type == UUID.class) {
                return UUID.fromString(text);
            }
        } catch (RuntimeException exception) {
            throw invalidFilter("Giá trị filter không hợp lệ cho kiểu " + type.getSimpleName() + ": " + value);
        }

        throw invalidFilter("Không hỗ trợ kiểu field filter: " + type.getSimpleName());
    }

    private Number convertNumber(String text, Class<?> type) {
        BigDecimal decimal = new BigDecimal(text);
        if (type == BigDecimal.class) {
            return decimal;
        }
        if (type == BigInteger.class) {
            return decimal.toBigIntegerExact();
        }
        if (type == Integer.class) {
            return decimal.intValueExact();
        }
        if (type == Long.class) {
            return decimal.longValueExact();
        }
        if (type == Short.class) {
            return decimal.shortValueExact();
        }
        if (type == Byte.class) {
            return decimal.byteValueExact();
        }
        if (type == Double.class) {
            return decimal.doubleValue();
        }
        if (type == Float.class) {
            return decimal.floatValue();
        }
        throw invalidFilter("Không hỗ trợ kiểu số filter: " + type.getSimpleName());
    }

    private Class<?> wrapPrimitive(Class<?> type) {
        if (!type.isPrimitive()) {
            return type;
        }
        if (type == int.class) return Integer.class;
        if (type == long.class) return Long.class;
        if (type == short.class) return Short.class;
        if (type == byte.class) return Byte.class;
        if (type == double.class) return Double.class;
        if (type == float.class) return Float.class;
        if (type == boolean.class) return Boolean.class;
        if (type == char.class) return Character.class;
        return type;
    }

    private boolean isScalarType(Class<?> type) {
        return type.isPrimitive()
                || type.isEnum()
                || CharSequence.class.isAssignableFrom(type)
                || Number.class.isAssignableFrom(wrapPrimitive(type))
                || type == Boolean.class
                || type == Character.class
                || java.time.temporal.Temporal.class.isAssignableFrom(type)
                || type == Instant.class
                || type == UUID.class;
    }

    private AppException invalidFilter(String message) {
        return new AppException(ErrorCode.VALIDATION_FAILED, message, HttpStatus.BAD_REQUEST);
    }

    private enum Comparison {
        GREATER_THAN,
        GREATER_THAN_OR_EQUAL,
        LESS_THAN,
        LESS_THAN_OR_EQUAL
    }
}
