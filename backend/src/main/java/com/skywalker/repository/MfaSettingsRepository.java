package com.skywalker.repository;

import com.skywalker.entity.MfaSettings;
import com.skywalker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface MfaSettingsRepository extends JpaRepository<MfaSettings, UUID> {
    Optional<MfaSettings> findByUser(User user);
}
