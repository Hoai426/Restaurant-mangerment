package restaurant_management_be.services;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import restaurant_management_be.dto.users.UserCreateRequest;
import restaurant_management_be.dto.users.UserCreateResponse;
import restaurant_management_be.dto.users.UserResponse;
import restaurant_management_be.dto.users.UserUpdateProfileRequest;
import restaurant_management_be.dto.users.UserUpdateRequest;
import restaurant_management_be.dto.users.UserUpdateStatusRequest;
import restaurant_management_be.entities.User;
import restaurant_management_be.dto.users.UserUpdateProfileResponse;
import restaurant_management_be.dto.auth.OtpVerifyRequest;

import java.util.Optional;

public interface UserService {
    UserResponse getUserDetails(Long userId);

    UserResponse getMyProfile(String username);

    Page<UserResponse> getAllUsers(Pageable pageable);

    Optional<User> findByRole(User.Role role);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhone(String phone);

    User save(User user);

    UserCreateResponse createUser(UserCreateRequest request);

    UserUpdateProfileResponse updateMyProfile(String username, UserUpdateProfileRequest request);

    UserResponse updateUser(Long userId, UserUpdateRequest request);

    UserResponse verifyEmailChange(String username, OtpVerifyRequest request);

    UserResponse resendEmailChangeOtp(String username, String tempToken);

    UserResponse verifyUserCreation(OtpVerifyRequest request);

    UserCreateResponse resendUserCreationOtp(String tempToken);

    UserResponse updateUserStatus(String currentUsername, Long userId, UserUpdateStatusRequest request);

}
