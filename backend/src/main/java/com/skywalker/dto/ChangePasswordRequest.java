package com.skywalker.dto;

import lombok.Data;

@Data
public class ChangePasswordRequest {
    private String currentPassword; // null if user has no password yet (OAuth2 only)
    private String newPassword;
}
