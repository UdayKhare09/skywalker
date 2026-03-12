package com.skywalker.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Jwt jwt = new Jwt();
    private Cors cors = new Cors();
    private WebAuthn webauthn = new WebAuthn();

    @Data
    public static class Jwt {
        private String secret;
        private long accessTokenExpirationMs = 900_000; // 15 min
        private long refreshTokenExpirationMs = 604_800_000; // 7 days
    }

    @Data
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:5173");
    }

    @Data
    public static class WebAuthn {
        private String rpId = "localhost";
        private String rpName = "Skywalker Auth";
        private String rpOrigin = "http://localhost:5173";
    }
}
