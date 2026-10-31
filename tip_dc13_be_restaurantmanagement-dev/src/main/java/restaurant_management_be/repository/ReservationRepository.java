package restaurant_management_be.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import restaurant_management_be.entities.Reservation;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long>,
                JpaSpecificationExecutor<Reservation> {

        boolean existsByReservationCode(String reservationCode);

        @Query("SELECT DISTINCT r.table.id FROM Reservation r " +
                        "WHERE r.table.id IN :tableIds " +
                        "AND r.reservationDate = :date " +
                        "AND r.status IN ('PENDING', 'CONFIRMED') " +
                        "AND r.startTime < :endTime " +
                        "AND r.endTime > :startTime")
        List<Long> findConflictingTableIds(@Param("tableIds") List<Long> tableIds,
                        @Param("date") LocalDate date,
                        @Param("startTime") LocalTime startTime,
                        @Param("endTime") LocalTime endTime);

        List<Reservation> findAllByReservationCode(String reservationCode);

        @Query("SELECT DISTINCT r.table.id FROM Reservation r " +
                        "WHERE r.table.id IN :tableIds " +
                        "AND r.reservationDate = :date " +
                        "AND r.status IN ('PENDING', 'CONFIRMED') " +
                        "AND r.startTime < :endTime " +
                        "AND r.endTime > :startTime " +
                        "AND r.id NOT IN :excludeIds")
        List<Long> findConflictingTableIdsExcluding(@Param("tableIds") List<Long> tableIds,
                        @Param("date") LocalDate date,
                        @Param("startTime") LocalTime startTime,
                        @Param("endTime") LocalTime endTime,
                        @Param("excludeIds") List<Long> excludeIds);

        @Query("SELECT COUNT(r) FROM Reservation r " +
                        "WHERE r.table.id = :tableId " +
                        "AND r.status IN ('PENDING', 'CONFIRMED') " +
                        "AND r.id NOT IN :excludeIds")
        long countActiveByTableExcluding(@Param("tableId") Long tableId,
                        @Param("excludeIds") List<Long> excludeIds);
}
