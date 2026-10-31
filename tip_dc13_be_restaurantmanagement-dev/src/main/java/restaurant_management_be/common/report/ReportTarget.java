package restaurant_management_be.common.report;

import restaurant_management_be.entities.Order;
import restaurant_management_be.entities.OrderItem;
import restaurant_management_be.entities.Payment;

public enum ReportTarget {

    PAYMENTS(Payment.class),
    ORDERS(Order.class),
    ORDER_ITEMS(OrderItem.class);

    private final Class<?> entityClass;

    ReportTarget(Class<?> entityClass) {
        this.entityClass = entityClass;
    }

    public Class<?> entityClass() {
        return entityClass;
    }
}
