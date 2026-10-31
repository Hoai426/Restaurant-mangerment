ALTER TABLE reservations
    ADD COLUMN customer_name  VARCHAR(100) NOT NULL AFTER customer_id,
    ADD COLUMN customer_phone VARCHAR(20)  NOT NULL AFTER customer_name,
    ADD COLUMN created_by     BIGINT       NOT NULL AFTER table_id,
    ADD COLUMN created_by_role ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL AFTER created_by,
    MODIFY COLUMN customer_id BIGINT NULL,
    ADD CONSTRAINT fk_reservation_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT;

ALTER TABLE reservations
    DROP INDEX reservation_code,
    ADD INDEX idx_reservations_reservation_code (reservation_code);
