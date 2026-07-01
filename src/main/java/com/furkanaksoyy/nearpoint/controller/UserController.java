package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.dto.FavoriteDto;
import com.furkanaksoyy.nearpoint.security.AuthPrincipal;
import com.furkanaksoyy.nearpoint.service.FavoriteService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/me")
@Tag(name = "Me", description = "Authenticated user profile and synced favorites")
public class UserController {

    private final FavoriteService favoriteService;

    public UserController(FavoriteService favoriteService) {
        this.favoriteService = favoriteService;
    }

    @GetMapping
    public Map<String, Object> me(@AuthenticationPrincipal AuthPrincipal principal) {
        return Map.of("id", principal.id(), "email", principal.email());
    }

    @GetMapping("/favorites")
    public List<FavoriteDto> favorites(@AuthenticationPrincipal AuthPrincipal principal) {
        return favoriteService.list(principal.id());
    }

    @PostMapping("/favorites")
    public ResponseEntity<Void> addFavorite(@AuthenticationPrincipal AuthPrincipal principal,
                                            @Valid @RequestBody FavoriteDto dto) {
        favoriteService.add(principal.id(), dto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/favorites/{placeId}")
    public ResponseEntity<Void> removeFavorite(@AuthenticationPrincipal AuthPrincipal principal,
                                               @PathVariable String placeId) {
        favoriteService.remove(principal.id(), placeId);
        return ResponseEntity.noContent().build();
    }
}
