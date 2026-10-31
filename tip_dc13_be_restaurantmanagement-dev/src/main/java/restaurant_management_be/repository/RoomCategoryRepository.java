package restaurant_management_be.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import restaurant_management_be.entities.*;

import java.util.Optional;
import java.util.List;

public interface RoomCategoryRepository extends JpaRepository<RoomCategory, Long> {
    Optional<RoomCategory> findByName(String name);

    @Override
    List<RoomCategory> findAll();
}