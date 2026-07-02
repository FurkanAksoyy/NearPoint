package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.dto.PushSubscribeRequest;
import com.furkanaksoyy.nearpoint.security.AuthPrincipal;
import com.furkanaksoyy.nearpoint.service.PushService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/push")
@Tag(name = "Push", description = "Web push notification subscriptions")
public class PushController {

    private final PushService pushService;

    public PushController(PushService pushService) {
        this.pushService = pushService;
    }

    @GetMapping("/public-key")
    public Map<String, String> publicKey() {
        return Map.of("publicKey", pushService.getPublicKey());
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(@Valid @RequestBody PushSubscribeRequest request,
                                          @AuthenticationPrincipal AuthPrincipal principal) {
        pushService.subscribe(request.endpoint(), request.p256dh(), request.auth(),
                principal != null ? principal.id() : null);
        return ResponseEntity.ok().build();
    }
}
