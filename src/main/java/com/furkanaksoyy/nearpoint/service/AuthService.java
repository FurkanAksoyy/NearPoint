package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.dto.AuthResponse;
import com.furkanaksoyy.nearpoint.dto.LoginRequest;
import com.furkanaksoyy.nearpoint.dto.RegisterRequest;
import com.furkanaksoyy.nearpoint.exception.EmailAlreadyUsedException;
import com.furkanaksoyy.nearpoint.exception.InvalidCredentialsException;
import com.furkanaksoyy.nearpoint.model.User;
import com.furkanaksoyy.nearpoint.repository.UserRepository;
import com.furkanaksoyy.nearpoint.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyUsedException();
        }
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(displayName(request.displayName(), email));
        user.setCreatedAt(LocalDateTime.now());
        userRepository.save(user);
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.email().trim().toLowerCase())
                .orElseThrow(InvalidCredentialsException::new);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        return toResponse(user);
    }

    private String displayName(String provided, String email) {
        if (provided != null && !provided.isBlank()) {
            return provided.trim();
        }
        return email.substring(0, email.indexOf('@'));
    }

    private AuthResponse toResponse(User user) {
        boolean admin = "ADMIN".equals(user.getRole());
        return new AuthResponse(jwtService.generate(user), user.getEmail(), user.getDisplayName(), admin);
    }
}
