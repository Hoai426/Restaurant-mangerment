package restaurant_management_be.dto.tables;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import restaurant_management_be.entities.Tables;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TableUpdateStatusRequest {

    @NotNull(message = "Trạng thái bàn không được để trống")
    private Tables.Status status;
}