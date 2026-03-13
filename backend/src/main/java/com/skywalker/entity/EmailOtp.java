package com.skywalker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "email_otps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String otpCode; // 6-char alphanumeric

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(nullable = false)
    private String purpose; // "mfa_login"

    public boolean isExpired() {
        return Instant.now().isAfter(expiryDate);
    }
}
