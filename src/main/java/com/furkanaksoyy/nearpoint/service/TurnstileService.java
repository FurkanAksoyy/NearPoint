package com.furkanaksoyy.nearpoint.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Verifies Cloudflare Turnstile tokens.
 * If no secret key is configured, verification is disabled (returns true) so that
 * local development and unprotected deployments keep working.
 */
@Service
public class TurnstileService {

    private static final String VERIFY_URL =
            "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private final RestTemplate restTemplate;

    @Value("${turnstile.secret-key:}")
    private String secretKey;

    @Autowired
    public TurnstileService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean isEnabled() {
        return secretKey != null && !secretKey.isBlank();
    }

    public boolean verify(String token, String remoteIp) {
        if (!isEnabled()) {
            return true; // protection not configured -> allow
        }
        if (token == null || token.isBlank()) {
            return false;
        }

        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("secret", secretKey);
        form.add("response", token);
        if (remoteIp != null && !remoteIp.isBlank()) {
            form.add("remoteip", remoteIp);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

        try {
            Map<?, ?> response = restTemplate.postForObject(VERIFY_URL, request, Map.class);
            return response != null && Boolean.TRUE.equals(response.get("success"));
        } catch (Exception e) {
            System.err.println("Turnstile verification error: " + e.getMessage());
            return false;
        }
    }
}
