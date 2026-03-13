package com.skywalker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotpSetupResponse {
    private String secret;      // Raw base32 secret (hidden, use QR)
    private String otpauthUrl;  // otpauth://totp/... for QR code
    private String qrCodeBase64; // PNG QR as base64 data URI
}
