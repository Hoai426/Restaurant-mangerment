package restaurant_management_be.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import restaurant_management_be.entities.Dish;
import java.util.List;
import java.util.Optional;

public interface DishRepository extends JpaRepository<Dish, Long>, JpaSpecificationExecutor<Dish> {
    @Override
    @EntityGraph(attributePaths = "categories")
    List<Dish> findAll();

    @Override
    @EntityGraph(attributePaths = "categories")
    Optional<Dish> findById(Long id);

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);
}
