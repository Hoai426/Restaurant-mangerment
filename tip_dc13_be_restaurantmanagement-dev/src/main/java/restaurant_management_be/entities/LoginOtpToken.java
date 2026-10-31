package restaurant_management_be.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "loginotptokens")
public class LoginOtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "purpose", nullable = false, length = 32)
    private String purpose;

    @Column(name = "target", length = 100)
    private String target;

    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;

    @Column(name = "otp_code", nullable = false, length = 10)
    private String otpCode;

    @Column(name = "temp_token", nullable = false, unique = true, length = 256)
    private String tempToken;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean used = false;

    @Column(name = "attempt_count", nullable = false)
    private int attemptCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isUsed() {
        return used;
    }
}