package com.furkanaksoyy.nearpoint.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * Optional API-key gate for {@code /api/**}. Disabled when {@code api.key} is blank,
 * so the public browser demo keeps working with zero config (mirrors TurnstileService).
 * When configured, requests must send a matching {@code X-API-Key} header.
 */
public class ApiKeyAuthFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-API-Key";

    private final String apiKey;

    public ApiKeyAuthFilter(String apiKey) {
        this.apiKey = apiKey;
    }

    private boolean enabled() {
        return apiKey != null && !apiKey.isBlank();
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        if (enabled() && request.getRequestURI().startsWith("/api/")) {
            String provided = request.getHeader(HEADER);
            if (provided == null || !constantTimeEquals(provided, apiKey)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"status\":401,\"title\":\"Unauthorized\",\"detail\":\"Missing or invalid API key\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }

    private boolean constantTimeEquals(String a, String b) {
        return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
    }
}
