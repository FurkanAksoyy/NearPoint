package com.furkanaksoyy.nearpoint.service;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the Turnstile enable/disable logic (no network calls).
 */
class TurnstileServiceTest {

    private TurnstileService withSecret(String secret) {
        TurnstileService service = new TurnstileService(new RestTemplate());
        ReflectionTestUtils.setField(service, "secretKey", secret);
        return service;
    }

    @Test
    void disabledWhenSecretBlankAllowsEverything() {
        TurnstileService service = withSecret("");
        assertThat(service.isEnabled()).isFalse();
        assertThat(service.verify(null, null)).isTrue();
        assertThat(service.verify("anything", "1.2.3.4")).isTrue();
    }

    @Test
    void enabledRejectsMissingOrBlankToken() {
        TurnstileService service = withSecret("some-secret");
        assertThat(service.isEnabled()).isTrue();
        assertThat(service.verify(null, "1.2.3.4")).isFalse();
        assertThat(service.verify("   ", "1.2.3.4")).isFalse();
    }
}
