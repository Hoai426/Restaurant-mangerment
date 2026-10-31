package restaurant_management_be.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import restaurant_management_be.entities.Category;
import java.util.Optional;


public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);
}
