package com.skywalker.repository;

import com.skywalker.entity.EmailOtp;
import com.skywalker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface EmailOtpRepository extends JpaRepository<EmailOtp, UUID> {
    Optional<EmailOtp> findTopByUserAndPurposeOrderByExpiryDateDesc(User user, String purpose);
    void deleteByUser(User user);
}
