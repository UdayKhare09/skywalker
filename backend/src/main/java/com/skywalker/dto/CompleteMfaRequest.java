package com.skywalker.dto;

import lombok.Data;

@Data
public class CompleteMfaRequest {
    private String pendingToken;
    private String method;  // "email_otp" | "totp" | "passkey"
    private String code;    // OTP code / TOTP code (passkey handled separately)
}
