package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.model.PushSubscription;
import com.furkanaksoyy.nearpoint.repository.PushSubscriptionRepository;
import jakarta.annotation.PostConstruct;
import nl.martijndwars.webpush.Notification;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.Security;
import java.time.LocalDateTime;

@Service
public class PushService {

    private static final Logger log = LoggerFactory.getLogger(PushService.class);

    private final PushSubscriptionRepository repository;
    private final String publicKey;
    private final String privateKey;
    private final String subject;

    private nl.martijndwars.webpush.PushService pushService;

    public PushService(PushSubscriptionRepository repository,
                       @Value("${vapid.public-key}") String publicKey,
                       @Value("${vapid.private-key}") String privateKey,
                       @Value("${vapid.subject}") String subject) {
        this.repository = repository;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
        this.subject = subject;
    }

    @PostConstruct
    void init() {
        if (publicKey == null || publicKey.isBlank() || privateKey == null || privateKey.isBlank()) {
            log.info("Web push disabled (VAPID keys not configured)");
            return;
        }
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        try {
            this.pushService = new nl.martijndwars.webpush.PushService(publicKey, privateKey, subject);
        } catch (Exception e) {
            log.error("Failed to init web-push: {}", e.getMessage());
        }
    }

    public String getPublicKey() {
        return publicKey;
    }

    @Transactional
    public void subscribe(String endpoint, String p256dh, String auth, Long userId) {
        PushSubscription sub = repository.findByEndpoint(endpoint).orElseGet(PushSubscription::new);
        sub.setEndpoint(endpoint);
        sub.setP256dh(p256dh);
        sub.setAuth(auth);
        sub.setUserId(userId);
        boolean isNew = sub.getCreatedAt() == null;
        if (isNew) {
            sub.setCreatedAt(LocalDateTime.now());
        }
        repository.save(sub);
        // Send a confirmation ping server-side (no separate, probeable endpoint)
        if (isNew) {
            send(sub, "{\"title\":\"NearPoint\",\"body\":\"Notifications are on 🎉 We'll ping you about great places nearby.\",\"url\":\"/\"}");
        }
    }

    public void send(PushSubscription sub, String jsonPayload) {
        if (pushService == null) {
            log.warn("Push not configured");
            return;
        }
        try {
            Notification notification = new Notification(
                    sub.getEndpoint(), sub.getP256dh(), sub.getAuth(),
                    jsonPayload.getBytes(StandardCharsets.UTF_8));
            pushService.send(notification);
        } catch (Exception e) {
            log.warn("Push send failed ({}): {}", e.getClass().getSimpleName(), e.getMessage());
        }
    }
}
