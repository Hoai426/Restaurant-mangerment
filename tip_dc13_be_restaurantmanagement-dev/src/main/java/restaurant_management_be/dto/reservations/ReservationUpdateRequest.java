package restaurant_management_be.dto.reservations;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationUpdateRequest {

    @FutureOrPresent(message = "Ngày đặt phải từ hôm nay trở đi")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate reservationDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    @Min(value = 1, message = "Số người phải lớn hơn 0")
    private Integer numberOfGuests;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String note;

    @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
    private String customerPhone;

    @Size(max = 100, message = "Tên khách hàng tối đa 100 ký tự")
    private String customerName;

    private List<Long> tableIds;
}