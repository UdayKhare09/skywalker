package com.skywalker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String message;
    private UserResponse user;

    // MFA challenge fields — only set when mfaRequired = true
    private boolean mfaRequired;
    private String pendingToken;
    private List<String> availableMfaMethods; // e.g. ["email_otp", "totp", "passkey"]
}
