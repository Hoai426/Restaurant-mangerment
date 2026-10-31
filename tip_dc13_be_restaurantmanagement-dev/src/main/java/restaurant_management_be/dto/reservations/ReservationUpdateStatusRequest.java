package restaurant_management_be.dto.reservations;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import restaurant_management_be.entities.Reservation;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationUpdateStatusRequest {

    @NotNull(message = "Trạng thái đặt bàn không được để trống")
    private Reservation.Status status;
}