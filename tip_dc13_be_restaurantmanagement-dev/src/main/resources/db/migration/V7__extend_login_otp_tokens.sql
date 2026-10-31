-- Dọn bản ghi OTP hết hạn (nếu có) trước khi mở rộng
DELETE FROM loginotptokens
WHERE expires_at < NOW();

ALTER TABLE loginotptokens
    MODIFY user_id BIGINT NULL;

ALTER TABLE loginotptokens
    ADD COLUMN purpose VARCHAR(32) NULL,
    ADD COLUMN target  VARCHAR(100) NULL,
    ADD COLUMN payload TEXT NULL;

-- Dòng cũ (nếu có) đều thuộc luồng quên mật khẩu
UPDATE loginotptokens
SET purpose = 'FORGOT_PASSWORD'
WHERE purpose IS NULL;

ALTER TABLE loginotptokens
    MODIFY purpose VARCHAR(32) NOT NULL;

CREATE INDEX idx_otp_purpose_target
    ON loginotptokens(purpose, target);
