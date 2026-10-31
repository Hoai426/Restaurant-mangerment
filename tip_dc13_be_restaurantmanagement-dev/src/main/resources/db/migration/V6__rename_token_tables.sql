-- Rename token tables to match entity @Table names
-- (LoginOtpToken -> loginotptokens, EmailVerificationToken -> emailverificationtokens)

RENAME TABLE login_otp_tokens TO loginotptokens;

RENAME TABLE email_verification_tokens TO emailverificationtokens;
