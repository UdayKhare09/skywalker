package com.skywalker.repository;

import com.skywalker.entity.OAuth2Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OAuth2AccountRepository extends JpaRepository<OAuth2Account, UUID> {

    Optional<OAuth2Account> findByProviderAndProviderAccountId(String provider, String providerAccountId);

    boolean existsByProviderAndProviderAccountId(String provider, String providerAccountId);

    boolean existsByUser_Id(UUID userId);
}
