package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.dto.ShareRequest;
import com.furkanaksoyy.nearpoint.dto.SharedListResponse;
import com.furkanaksoyy.nearpoint.security.AuthPrincipal;
import com.furkanaksoyy.nearpoint.service.ShareService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/share")
@Tag(name = "Share", description = "Publicly shareable lists and trips")
public class ShareController {

    private final ShareService shareService;

    public ShareController(ShareService shareService) {
        this.shareService = shareService;
    }

    @PostMapping
    public Map<String, String> create(@Valid @RequestBody ShareRequest request,
                                      @AuthenticationPrincipal AuthPrincipal principal) {
        String slug = shareService.create(request, principal != null ? principal.id() : null);
        return Map.of("slug", slug);
    }

    @GetMapping("/{slug}")
    public SharedListResponse get(@PathVariable String slug) {
        return shareService.get(slug);
    }
}
