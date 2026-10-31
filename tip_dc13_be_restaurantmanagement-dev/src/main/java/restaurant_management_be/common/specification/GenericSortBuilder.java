package restaurant_management_be.common.specification;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class GenericSortBuilder {

    private GenericSortBuilder() {
    }

    public static Pageable applySorts(List<SortCriteria> sorts, Pageable pageable) {
        if (sorts == null || sorts.isEmpty()) {
            return pageable;
        }

        List<Sort.Order> orders = sorts.stream()
                .map(sort -> "DESC".equalsIgnoreCase(sort.getDirection())
                        ? Sort.Order.desc(sort.getField())
                        : Sort.Order.asc(sort.getField()))
                .toList();

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
    }
}