package restaurant_management_be.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import restaurant_management_be.dto.auth.LoginResponse;
import restaurant_management_be.dto.users.UserCreateRequest;
import restaurant_management_be.dto.users.UserResponse;
import restaurant_management_be.entities.User;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    LoginResponse.UserResponse toUserResponse(User user);

    UserResponse toUserDetailResponse(User user);

    @Mapping(source = "isActive", target = "active")
    User toEntity(UserCreateRequest request);
}
