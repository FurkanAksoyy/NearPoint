package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.dto.AdminStatsResponse;
import com.furkanaksoyy.nearpoint.security.AuthPrincipal;
import com.furkanaksoyy.nearpoint.service.AdminService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Admin-only dashboard stats")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> stats(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null || !adminService.isAdmin(principal.id())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(adminService.stats());
    }
}
