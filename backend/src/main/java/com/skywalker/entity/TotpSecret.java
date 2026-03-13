package com.skywalker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "totp_secrets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TotpSecret {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String secret; // Base32-encoded TOTP secret

    @Builder.Default
    @Column(nullable = false)
    private boolean confirmed = false; // false until user verifies first code
}
