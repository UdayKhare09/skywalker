package com.skywalker.controller;

import com.skywalker.dto.WebAuthnAuthenticationRequest;
import com.skywalker.dto.WebAuthnRegistrationRequest;
import com.skywalker.entity.User;
import com.skywalker.security.CookieUtils;
import com.skywalker.security.JwtService;
import com.skywalker.service.WebAuthnService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/webauthn")
@RequiredArgsConstructor
public class WebAuthnController {

    private final WebAuthnService webAuthnService;
    private final JwtService jwtService;
    private final CookieUtils cookieUtils;

    /**
     * GET /api/webauthn/register/options
     * Returns registration options for the authenticated user.
     */
    @GetMapping("/register/options")
    public ResponseEntity<Map<String, Object>> getRegistrationOptions(
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> options = webAuthnService.generateRegistrationOptions(userDetails.getUsername());
        return ResponseEntity.ok(options);
    }

    /**
     * POST /api/webauthn/register
     * Verifies and stores the passkey credential.
     */
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> verifyRegistration(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody WebAuthnRegistrationRequest request) {
        webAuthnService.verifyRegistration(
                userDetails.getUsername(),
                request.getCredentialId(),
                request.getAttestationObject(),
                request.getClientDataJSON(),
                request.getLabel(),
                request.getTransports()
        );
        return ResponseEntity.ok(Map.of("message", "Passkey registered successfully"));
    }

    /**
     * GET /api/webauthn/authenticate/options
     * Returns authentication options (challenge). Public endpoint.
     */
    @GetMapping("/authenticate/options")
    public ResponseEntity<Map<String, Object>> getAuthenticationOptions(
            @RequestParam(required = false) String email) {
        Map<String, Object> options = webAuthnService.generateAuthenticationOptions(email);
        return ResponseEntity.ok(options);
    }

    /**
     * POST /api/webauthn/authenticate
     * Verifies assertion and issues JWT cookies. Public endpoint.
     */
    @PostMapping("/authenticate")
    public ResponseEntity<Map<String, Object>> verifyAuthentication(
            @RequestBody WebAuthnAuthenticationRequest request,
            HttpServletResponse response) {
        User user = webAuthnService.verifyAuthentication(
                request.getCredentialId(),
                request.getAuthenticatorData(),
                request.getClientDataJSON(),
                request.getSignature(),
                request.getUserHandle()
        );

        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail(), user.getId());
        cookieUtils.setAccessTokenCookie(response, accessToken);
        cookieUtils.setRefreshTokenCookie(response, refreshToken);

        return ResponseEntity.ok(Map.of(
                "message", "Authentication successful",
                "email", user.getEmail()
        ));
    }

    /**
     * GET /api/webauthn/passkeys
     * Lists all passkeys for the authenticated user.
     */
    @GetMapping("/passkeys")
    public ResponseEntity<List<Map<String, Object>>> listPasskeys(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<Map<String, Object>> passkeys = webAuthnService.listPasskeys(userDetails.getUsername());
        return ResponseEntity.ok(passkeys);
    }

    /**
     * DELETE /api/webauthn/passkeys/{credentialId}
     * Deletes a passkey for the authenticated user.
     */
    @DeleteMapping("/passkeys/{credentialId}")
    public ResponseEntity<Map<String, Object>> deletePasskey(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String credentialId) {
        webAuthnService.deletePasskey(userDetails.getUsername(), credentialId);
        return ResponseEntity.ok(Map.of("message", "Passkey deleted"));
    }
}
