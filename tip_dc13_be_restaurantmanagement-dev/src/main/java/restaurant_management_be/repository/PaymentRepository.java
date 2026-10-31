package restaurant_management_be.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import restaurant_management_be.entities.Payment;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    boolean existsByOrderId(Long orderId);
    boolean existsByOrderIdAndStatus(Long orderId, Payment.Status status);
    boolean existsByTransactionCode(String transactionCode);
    Optional<Payment> findByOrderId(Long orderId);
}
