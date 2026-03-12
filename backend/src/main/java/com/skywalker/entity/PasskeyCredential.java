package com.skywalker.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "passkey_credentials")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasskeyCredential {

    @Id
    @Column(name = "credential_id")
    private String credentialId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "public_key", nullable = false, columnDefinition = "bytea")
    private byte[] publicKey;

    @Column(name = "signature_count", nullable = false)
    @Builder.Default
    private long signatureCount = 0;

    @Column
    private String label;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "last_used_at")
    private Instant lastUsedAt;

    @Column(name = "aaguid")
    private String aaguid;

    @Column(name = "attestation_type")
    private String attestationType;

    @Column(name = "transports")
    private String transports;
}
