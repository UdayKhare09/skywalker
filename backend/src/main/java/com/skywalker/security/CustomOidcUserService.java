package com.skywalker.security;

import com.skywalker.entity.OAuth2Account;
import com.skywalker.entity.User;
import com.skywalker.repository.OAuth2AccountRepository;
import com.skywalker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    private final OAuth2AccountRepository oAuth2AccountRepository;

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerAccountId = oidcUser.getSubject();
        String email = oidcUser.getEmail();
        String fullName = oidcUser.getFullName();

        log.info("OAuth2 login: provider={}, email={}", provider, email);

        // Check if OAuth2 account already exists
        if (!oAuth2AccountRepository.existsByProviderAndProviderAccountId(provider, providerAccountId)) {
            // Find or create user by email
            User user = userRepository.findByEmail(email)
                    .map(existingUser -> {
                        // Auto-verify email if an unverified user logs in with Google
                        if (!existingUser.isEmailVerified()) {
                            existingUser.setEmailVerified(true);
                            return userRepository.save(existingUser);
                        }
                        return existingUser;
                    })
                    .orElseGet(() -> {
                        log.info("Creating new user for OAuth2 email: {}", email);
                        return userRepository.save(
                                User.builder()
                                        .email(email)
                                        .fullName(fullName)
                                        .role("ROLE_USER")
                                        .isEmailVerified(true)
                                        .build()
                        );
                    });

            // Link OAuth2 account to user
            OAuth2Account oAuth2Account = OAuth2Account.builder()
                    .user(user)
                    .provider(provider)
                    .providerAccountId(providerAccountId)
                    .build();
            oAuth2AccountRepository.save(oAuth2Account);
            log.info("Linked {} account to user: {}", provider, email);
        }

        return oidcUser;
    }
}
