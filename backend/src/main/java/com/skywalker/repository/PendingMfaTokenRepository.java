package com.skywalker.repository;

import com.skywalker.entity.PendingMfaToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PendingMfaTokenRepository extends JpaRepository<PendingMfaToken, UUID> {
    Optional<PendingMfaToken> findByToken(String token);
    void deleteByToken(String token);
}
