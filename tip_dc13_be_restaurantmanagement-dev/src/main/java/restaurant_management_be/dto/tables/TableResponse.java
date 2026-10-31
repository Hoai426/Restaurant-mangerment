package restaurant_management_be.dto.tables;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import restaurant_management_be.entities.Tables;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableResponse {
    private Long id;
    private Long roomId;
    private String roomName;
    private String tableNumber;
    private Integer capacity;
    private Tables.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}