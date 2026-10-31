-- V5__add_order_guest_and_note.sql
ALTER TABLE orders
    ADD COLUMN number_of_guests INT NULL AFTER table_id,
    ADD COLUMN note VARCHAR(500) NULL AFTER total_amount;

ALTER TABLE order_items
    ADD COLUMN note VARCHAR(200) NULL AFTER subtotal;
