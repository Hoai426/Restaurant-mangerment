package restaurant_management_be.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class StringUtil {
    public static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}