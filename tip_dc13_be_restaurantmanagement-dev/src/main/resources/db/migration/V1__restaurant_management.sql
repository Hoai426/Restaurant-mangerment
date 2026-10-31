-- 1. USERS

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(100) NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verified_at DATETIME NULL,

    phone VARCHAR(20) NOT NULL UNIQUE,

    role ENUM(
        'ADMIN',
        'STAFF',
        'CUSTOMER'
    ) NOT NULL DEFAULT 'CUSTOMER',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_users_email_verified
        CHECK (
            (email_verified = FALSE AND email_verified_at IS NULL)
            OR
            (email_verified = TRUE AND email_verified_at IS NOT NULL)
        )
) ENGINE=InnoDB;


-- 2. ROOM CATEGORIES

CREATE TABLE room_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 3. RESTAURANT ROOMS

CREATE TABLE restaurant_rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    category_id BIGINT NOT NULL,

    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    image_url VARCHAR(500),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_room_category
        FOREIGN KEY (category_id)
        REFERENCES room_categories(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. RESTAURANT TABLES

CREATE TABLE restaurant_tables (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    room_id BIGINT NOT NULL,

    table_number VARCHAR(20) NOT NULL,
    capacity INT NOT NULL,

    status ENUM(
        'AVAILABLE',
        'OCCUPIED',
        'RESERVED'
    ) NOT NULL DEFAULT 'AVAILABLE',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_table_capacity
        CHECK (capacity > 0),

    CONSTRAINT fk_table_room
        FOREIGN KEY (room_id)
        REFERENCES restaurant_rooms(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_table_room_number
        UNIQUE (room_id, table_number)
) ENGINE=InnoDB;


-- 5. MENU CATEGORIES

CREATE TABLE menu_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;


-- 6. DISHES

CREATE TABLE dishes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    image_url VARCHAR(500),

    price DECIMAL(12,2) NOT NULL,

    is_available BOOLEAN NOT NULL DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_dish_price
        CHECK (price >= 0)
) ENGINE=InnoDB;


-- 7. MENU CATEGORY - DISH

CREATE TABLE menu_category_dishes (
    category_id BIGINT NOT NULL,
    dish_id BIGINT NOT NULL,

    PRIMARY KEY (category_id, dish_id),

    CONSTRAINT fk_category_dish_category
        FOREIGN KEY (category_id)
        REFERENCES menu_categories(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_category_dish_dish
        FOREIGN KEY (dish_id)
        REFERENCES dishes(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;


-- 8. RESERVATIONS

CREATE TABLE reservations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    reservation_code VARCHAR(30) NOT NULL UNIQUE,

    customer_id BIGINT NOT NULL,
    table_id BIGINT NOT NULL,

    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    number_of_guests INT NOT NULL,

    status ENUM(
        'PENDING',
        'CONFIRMED',
        'CANCELLED',
        'COMPLETED',
        'NO_SHOW'
    ) NOT NULL DEFAULT 'PENDING',

    note VARCHAR(500),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_reservation_guests
        CHECK (number_of_guests > 0),

    CONSTRAINT chk_reservation_time
        CHECK (end_time > start_time),

    CONSTRAINT fk_reservation_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_reservation_table
        FOREIGN KEY (table_id)
        REFERENCES restaurant_tables(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 9. ORDERS

CREATE TABLE orders (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_code VARCHAR(30) NOT NULL UNIQUE,

    table_id BIGINT NOT NULL,
    customer_id BIGINT NULL,
    reservation_id BIGINT NULL,
    created_by BIGINT NOT NULL,

    status ENUM(
        'PENDING',
        'CONFIRMED',
        'COMPLETED',
        'CANCELLED'
    ) NOT NULL DEFAULT 'PENDING',

    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT chk_order_total
        CHECK (total_amount >= 0),

    CONSTRAINT fk_order_table
        FOREIGN KEY (table_id)
        REFERENCES restaurant_tables(id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_order_customer
        FOREIGN KEY (customer_id)
        REFERENCES users(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_order_reservation
        FOREIGN KEY (reservation_id)
        REFERENCES reservations(id)
        ON DELETE SET NULL,

    CONSTRAINT fk_order_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 10. ORDER ITEMS

CREATE TABLE order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL,
    dish_id BIGINT NOT NULL,

    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_order_item_quantity
        CHECK (quantity > 0),

    CONSTRAINT chk_order_item_unit_price
        CHECK (unit_price >= 0),

    CONSTRAINT chk_order_item_subtotal
        CHECK (subtotal >= 0),

    CONSTRAINT fk_order_item_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_order_item_dish
        FOREIGN KEY (dish_id)
        REFERENCES dishes(id)
        ON DELETE RESTRICT,

    CONSTRAINT uq_order_item_dish
        UNIQUE (order_id, dish_id)
) ENGINE=InnoDB;

-- 11. PAYMENTS

CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT NOT NULL UNIQUE,

    amount DECIMAL(12,2) NOT NULL,

    payment_method ENUM(
        'CASH',
        'CARD',
        'QR'
    ) NOT NULL,

    status ENUM(
        'PENDING',
        'SUCCESS',
        'FAILED'
    ) NOT NULL DEFAULT 'PENDING',

    transaction_code VARCHAR(100) UNIQUE,

    paid_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_payment_amount
        CHECK (amount >= 0),

    CONSTRAINT fk_payment_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 12. REFRESH TOKENS

CREATE TABLE refresh_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    token VARCHAR(500) NOT NULL UNIQUE,

    expires_at DATETIME NOT NULL,

    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_refresh_token_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_refresh_user
    ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_expires
    ON refresh_tokens(expires_at);


-- 13. EMAIL VERIFICATION TOKENS

CREATE TABLE email_verification_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    token VARCHAR(256) NOT NULL UNIQUE,

    expires_at DATETIME NOT NULL,

    used_at DATETIME NULL,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_email_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_email_tokens_user
    ON email_verification_tokens(user_id);

CREATE INDEX idx_email_tokens_expires
    ON email_verification_tokens(expires_at);

-- 14. LOGIN OTP TOKENS

CREATE TABLE login_otp_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT NOT NULL,

    otp_code VARCHAR(10) NOT NULL,

    temp_token VARCHAR(256) NOT NULL UNIQUE,

    expires_at DATETIME NOT NULL,

    used BOOLEAN NOT NULL DEFAULT FALSE,

    attempt_count TINYINT UNSIGNED NOT NULL DEFAULT 0,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_otp_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_otp_attempt_count
        CHECK (attempt_count >= 0)
) ENGINE=InnoDB;

CREATE INDEX idx_otp_tokens_user
    ON login_otp_tokens(user_id);

CREATE INDEX idx_otp_tokens_expires
    ON login_otp_tokens(expires_at);