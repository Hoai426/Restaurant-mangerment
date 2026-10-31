package restaurant_management_be.dto.users;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateProfileRequest {

    @Email(message = "Email không đúng định dạng")
    @Size(max = 100, message = "Email tối đa 100 ký tự")
    private String email;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại phải gồm 10 đến 11 chữ số")
    private String phone;

    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String fullName;

    @Size(min = 6, max = 100, message = "Mật khẩu tối thiểu 6 ký tự và tối đa 100 ký tự")
    private String password;

    private String currentPassword;
}
