package com.furkanaksoyy.nearpoint.dto;

public record AuthResponse(String token, String email, String displayName, boolean admin) {
}
