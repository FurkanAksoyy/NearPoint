package com.furkanaksoyy.nearpoint;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class NearPointApplicationTests extends AbstractPostgresIT {

    @Test
    void contextLoads() {
        // Boots the full context (Flyway migrations included) against a Testcontainers PostgreSQL.
    }

}
