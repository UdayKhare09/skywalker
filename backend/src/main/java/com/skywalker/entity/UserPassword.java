package com.skywalker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "user_passwords")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPassword {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;
}
