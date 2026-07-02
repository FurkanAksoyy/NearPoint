package com.furkanaksoyy.nearpoint.security;

import com.furkanaksoyy.nearpoint.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);
    private static final String DEV_DEFAULT = "nearpoint-dev-secret-change-me-please-32chars-minimum-0123456789";

    private final SecretKey key;
    private final long expirationDays;

    public JwtService(@Value("${jwt.secret}") String secret,
                      @Value("${jwt.expiration-days:7}") long expirationDays,
                      @Value("${spring.profiles.active:}") String activeProfiles) {
        byte[] bytes = secret == null ? new byte[0] : secret.getBytes(StandardCharsets.UTF_8);
        boolean prod = activeProfiles != null && activeProfiles.contains("prod");
        boolean weak = bytes.length < 32 || DEV_DEFAULT.equals(secret);
        if (prod && weak) {
            throw new IllegalStateException(
                    "JWT_SECRET must be set to a strong, non-default value (>= 32 bytes) in production");
        }
        if (weak) {
            log.warn("Using a weak/default JWT secret — set a strong JWT_SECRET before deploying to production");
        }
        this.key = Keys.hmacShaKeyFor(bytes);
        this.expirationDays = expirationDays;
    }

    public String generate(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("uid", user.getId())
                .claim("name", user.getDisplayName())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(expirationDays, ChronoUnit.DAYS)))
                .signWith(key)
                .compact();
    }

    /** Parses and verifies the token; throws if invalid/expired. */
    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}
