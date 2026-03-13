package com.skywalker.repository;

import com.skywalker.entity.UserPassword;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserPasswordRepository extends JpaRepository<UserPassword, UUID> {

    Optional<UserPassword> findByUser_Id(UUID userId);

    Optional<UserPassword> findByUser_Email(String email);

    boolean existsByUser_Id(UUID userId);

    Optional<UserPassword> findByUser(com.skywalker.entity.User user);
}
