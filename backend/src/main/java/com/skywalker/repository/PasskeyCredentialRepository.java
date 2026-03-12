package com.skywalker.repository;

import com.skywalker.entity.PasskeyCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PasskeyCredentialRepository extends JpaRepository<PasskeyCredential, String> {

    List<PasskeyCredential> findAllByUser_Id(UUID userId);

    List<PasskeyCredential> findAllByUser_Email(String email);

    boolean existsByUser_Id(UUID userId);
}
