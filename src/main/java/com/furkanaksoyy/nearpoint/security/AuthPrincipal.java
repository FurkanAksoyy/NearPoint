package com.furkanaksoyy.nearpoint.security;

/** Authenticated principal carried in the SecurityContext for JWT-authenticated requests. */
public record AuthPrincipal(Long id, String email) {
}
