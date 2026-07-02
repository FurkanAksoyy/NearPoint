package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.dto.AdminStatsResponse;
import com.furkanaksoyy.nearpoint.security.AuthPrincipal;
import com.furkanaksoyy.nearpoint.service.AdminService;
import com.furkanaksoyy.nearpoint.service.FeaturedPollService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only dashboard stats")
public class AdminController {

    private final AdminService adminService;
    private final FeaturedPollService featuredPollService;

    public AdminController(AdminService adminService, FeaturedPollService featuredPollService) {
        this.adminService = adminService;
        this.featuredPollService = featuredPollService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> stats(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null || !adminService.isAdmin(principal.id())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(adminService.stats());
    }

    /** Manually generate this week's featured poll now (also runs automatically every Monday). */
    @PostMapping("/featured-poll")
    public ResponseEntity<Map<String, String>> generateFeatured(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null || !adminService.isAdmin(principal.id())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        String slug = featuredPollService.generate();
        return slug != null
                ? ResponseEntity.ok(Map.of("slug", slug))
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).build();
    }
}
