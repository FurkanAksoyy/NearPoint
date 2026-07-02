package com.furkanaksoyy.nearpoint.config;

import com.furkanaksoyy.nearpoint.security.ApiKeyAuthFilter;
import com.furkanaksoyy.nearpoint.security.JwtAuthFilter;
import com.furkanaksoyy.nearpoint.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Stateless security. Most endpoints are public so the browser demo works; the
 * {@link ApiKeyAuthFilter} enforces an API key only when configured, and JWT auth
 * ({@link JwtAuthFilter}) protects the per-user {@code /api/me/**} endpoints.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${api.key:}")
    private String apiKey;

    private final JwtService jwtService;

    public SecurityConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(
                                "/actuator/health/**", "/actuator/info",
                                "/actuator/prometheus", "/actuator/metrics/**").permitAll()
                        .requestMatchers(
                                "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        // Per-user + admin endpoints require a valid JWT (admin role checked in the controller)
                        .requestMatchers("/api/me/**", "/api/admin/**").authenticated()
                        // Auth + public place search stay open (ApiKeyAuthFilter gates when configured)
                        .requestMatchers("/api/auth/**", "/api/places/**").permitAll()
                        .anyRequest().permitAll())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .addFilterBefore(new JwtAuthFilter(jwtService), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(new ApiKeyAuthFilter(apiKey), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
