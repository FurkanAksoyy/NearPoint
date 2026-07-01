package com.furkanaksoyy.nearpoint.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Reads a Bearer JWT and, if valid, puts an {@link AuthPrincipal} into the SecurityContext.
 * Invalid/absent tokens leave the request anonymous (authorization rules then decide).
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            try {
                Claims claims = jwtService.parse(header.substring(7));
                Long uid = claims.get("uid", Long.class);
                AuthPrincipal principal = new AuthPrincipal(uid, claims.getSubject());
                var authentication = new UsernamePasswordAuthenticationToken(principal, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (Exception ignored) {
                // invalid token -> stays anonymous
            }
        }
        chain.doFilter(request, response);
    }
}
