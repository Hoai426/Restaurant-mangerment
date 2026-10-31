package restaurant_management_be.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import restaurant_management_be.entities.Order;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> , JpaSpecificationExecutor<Order> {
    boolean existsByOrderCode(String orderCode);

    @Query("SELECT COUNT(o) FROM Order o " +
            "WHERE o.table.id = :tableId " +
            "AND o.status IN ('PENDING','CONFIRMED') " +
            "AND o.id NOT IN :excludeIds")
    long countActiveByTableExcluding(@Param("tableId") Long tableId, @Param("excludeIds") List<Long> excludeIds);
}
