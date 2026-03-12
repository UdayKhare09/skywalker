package com.skywalker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "oauth2_accounts",
       uniqueConstraints = @UniqueConstraint(columnNames = {"provider", "provider_account_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OAuth2Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String provider;

    @Column(name = "provider_account_id", nullable = false)
    private String providerAccountId;
}
