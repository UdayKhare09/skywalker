package com.skywalker.security;

import com.skywalker.entity.OAuth2Account;
import com.skywalker.entity.User;
import com.skywalker.repository.OAuth2AccountRepository;
import com.skywalker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Handles standard OAuth2 (non-OIDC) logins.
 * Google may sometimes respond with a plain OAuth2 user instead of an OIDC user.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final OAuth2AccountRepository oAuth2AccountRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId();
        String providerAccountId = oAuth2User.getAttribute("sub");
        String email = oAuth2User.getAttribute("email");
        String fullName = oAuth2User.getAttribute("name");

        log.info("OAuth2 (standard) login: provider={}, email={}", provider, email);

        if (email == null) {
            throw new OAuth2AuthenticationException("Email not provided by OAuth2 provider");
        }

        // Check if OAuth2 account already exists
        if (!oAuth2AccountRepository.existsByProviderAndProviderAccountId(provider, providerAccountId)) {
            // Find or create user by email
            User user = userRepository.findByEmail(email)
                    .orElseGet(() -> {
                        log.info("Creating new user for OAuth2 email: {}", email);
                        return userRepository.save(
                                User.builder()
                                        .email(email)
                                        .fullName(fullName)
                                        .role("ROLE_USER")
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

        return oAuth2User;
    }
}
