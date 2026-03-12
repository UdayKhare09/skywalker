package com.skywalker.security;

import com.skywalker.entity.User;
import com.skywalker.entity.UserPassword;
import com.skywalker.repository.UserPasswordRepository;
import com.skywalker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserPasswordRepository userPasswordRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        String passwordHash = userPasswordRepository.findByUser_Email(email)
                .map(UserPassword::getPasswordHash)
                .orElse("{noop}");  // OAuth2-only users have no password — noop placeholder

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                passwordHash,
                List.of(new SimpleGrantedAuthority(user.getRole()))
        );
    }
}
