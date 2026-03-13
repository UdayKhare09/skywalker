package com.skywalker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "mfa_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MfaSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Builder.Default
    @Column(nullable = false)
    private boolean emailOtpEnabled = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean totpEnabled = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean passwordLoginDisabled = false;
}
