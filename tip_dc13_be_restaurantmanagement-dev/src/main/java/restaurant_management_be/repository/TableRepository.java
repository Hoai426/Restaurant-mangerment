package restaurant_management_be.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import restaurant_management_be.entities.Tables;
import java.util.List;

public interface TableRepository extends JpaRepository<Tables, Long> , JpaSpecificationExecutor<Tables> {
    boolean existsByRoomIdAndTableNumber(Long roomId, String tableNumber);

    boolean existsByRoomIdAndTableNumberAndIdNot(Long roomId, String tableNumber, Long id);

    @Override
    @EntityGraph(attributePaths = "room")
    List<Tables> findAll();
}