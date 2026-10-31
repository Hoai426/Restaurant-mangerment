package restaurant_management_be.dto.reservations;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import restaurant_management_be.entities.Reservation;
import restaurant_management_be.entities.User;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationResponse {
    private Long id;
    private String reservationCode;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long createdById;
    private String createdByName;
    private User.Role createdByRole;
    private Long tableId;
    private String tableNumber;
    private Long roomId;
    private String roomName;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reservationDate;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;
    private Integer numberOfGuests;
    private Reservation.Status status;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
