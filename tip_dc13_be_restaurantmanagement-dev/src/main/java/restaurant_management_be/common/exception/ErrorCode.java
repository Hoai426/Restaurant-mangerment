package restaurant_management_be.common.exception;

public final class ErrorCode {

    private ErrorCode() {
    }

    public static final String AUTH_USERNAME_EXISTS = "AUTH_USERNAME_EXISTS";
    public static final String AUTH_EMAIL_EXISTS = "AUTH_EMAIL_EXISTS";
    public static final String AUTH_PHONE_EXISTS = "AUTH_PHONE_EXISTS";
    public static final String AUTH_OTP_SESSION_INVALID = "AUTH_OTP_SESSION_INVALID";
    public static final String AUTH_OTP_EXPIRED = "AUTH_OTP_EXPIRED";
    public static final String AUTH_OTP_MAX_ATTEMPTS = "AUTH_OTP_MAX_ATTEMPTS";
    public static final String AUTH_OTP_INCORRECT = "AUTH_OTP_INCORRECT";
    public static final String AUTH_OTP_SESSION_NOT_FOUND = "AUTH_OTP_SESSION_NOT_FOUND";
    public static final String AUTH_OTP_ALREADY_USED = "AUTH_OTP_ALREADY_USED";
    public static final String AUTH_RESET_SESSION_INVALID = "AUTH_RESET_SESSION_INVALID";
    public static final String AUTH_RESET_SESSION_EXPIRED = "AUTH_RESET_SESSION_EXPIRED";
    public static final String AUTH_OTP_NOT_VERIFIED = "AUTH_OTP_NOT_VERIFIED";
    public static final String AUTH_USER_NOT_FOUND = "AUTH_USER_NOT_FOUND";
    public static final String AUTH_ACCOUNT_LOCKED = "AUTH_ACCOUNT_LOCKED";
    public static final String AUTH_INVALID_PASSWORD = "AUTH_INVALID_PASSWORD";
    public static final String AUTH_EMAIL_NOT_VERIFIED = "AUTH_EMAIL_NOT_VERIFIED";
    public static final String AUTH_EMAIL_NOT_FOUND = "AUTH_EMAIL_NOT_FOUND";
    public static final String AUTH_REFRESH_TOKEN_NOT_FOUND = "AUTH_REFRESH_TOKEN_NOT_FOUND";
    public static final String AUTH_REFRESH_TOKEN_REVOKED = "AUTH_REFRESH_TOKEN_REVOKED";
    public static final String AUTH_REFRESH_TOKEN_EXPIRED = "AUTH_REFRESH_TOKEN_EXPIRED";
    public static final String AUTH_TOKEN_EXPIRED = "AUTH_TOKEN_EXPIRED";
    public static final String ROOM_CATEGORY_EXISTS = "ROOM_CATEGORY_EXISTS";
    public static final String ROOM_CATEGORY_NOT_FOUND = "ROOM_CATEGORY_NOT_FOUND";
    public static final String USER_SINGLE_ADMIN = "USER_SINGLE_ADMIN";
    public static final String RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS";
    public static final String VALIDATION_FAILED = "VALIDATION_FAILED";
    public static final String INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR";
    public static final String ENV_VALIDATION_FAILED = "ENV_VALIDATION_FAILED";
    public static final String USER_NOT_FOUND = "USER_NOT_FOUND";
    public static final String USER_CURRENT_PASSWORD_INCORRECT = "USER_CURRENT_PASSWORD_INCORRECT";
    public static final String USER_CANNOT_DEACTIVATE_SELF = "USER_CANNOT_DEACTIVATE_SELF";
    public static final String CATEGORY_NOT_FOUND = "CATEGORY_NOT_FOUND";
    public static final String CATEGORY_EXISTS = "CATEGORY_EXISTS";
    public static final String DISH_NOT_FOUND = "DISH_NOT_FOUND";
    public static final String DISH_EXISTS = "DISH_EXISTS";
    public static final String ROOM_NOT_FOUND = "ROOM_NOT_FOUND";
    public static final String TABLE_EXISTS = "TABLE_EXISTS";
    public static final String TABLE_NOT_FOUND = "TABLE_NOT_FOUND";
    public static final String RESERVATION_CONFLICT = "RESERVATION_CONFLICT";
    public static final String RESERVATION_NOT_FOUND = "RESERVATION_NOT_FOUND";
    public static final String RESERVATION_NOT_EDITABLE = "RESERVATION_NOT_EDITABLE";
    public static final String ORDER_TABLE_RESERVED = "ORDER_TABLE_RESERVED";
    public static final String DISH_UNAVAILABLE = "DISH_UNAVAILABLE";
    public static final String ORDER_NOT_FOUND = "ORDER_NOT_FOUND";
    public static final String ORDER_NOT_EDITABLE = "ORDER_NOT_EDITABLE";
    public static final String PAYMENT_ALREADY_EXISTS = "PAYMENT_ALREADY_EXISTS";
    public static final String ORDER_ALREADY_PAID = "ORDER_ALREADY_PAID";
    public static final String PAYMENT_NOT_FOUND = "PAYMENT_NOT_FOUND";
    public static final String PAYMENT_ALREADY_PROCESSED = "PAYMENT_ALREADY_PROCESSED";


}
