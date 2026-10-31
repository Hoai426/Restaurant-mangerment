package restaurant_management_be.entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tables")
public class Tables {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    @Column(name = "table_number", nullable = false, length = 20)
    private String tableNumber;
    @Column(name = "capacity", nullable = false)
    private Integer capacity;
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "ENUM('AVAILABLE','OCCUPIED','RESERVED') DEFAULT 'AVAILABLE'")
    private Status status = Status.AVAILABLE;
    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false, updatable = false, insertable = false)
    private LocalDateTime updatedAt;

    public enum Status {
        AVAILABLE,
        OCCUPIED,
        RESERVED
    }
}