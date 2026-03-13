package com.skywalker.repository;

import com.skywalker.entity.TotpSecret;
import com.skywalker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface TotpSecretRepository extends JpaRepository<TotpSecret, UUID> {
    Optional<TotpSecret> findByUser(User user);
    void deleteByUser(User user);
}
