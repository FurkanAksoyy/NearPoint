package com.furkanaksoyy.nearpoint;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base class for tests that need a real PostgreSQL.
 * A single static container is shared across all subclasses (fast), and
 * {@link ServiceConnection} auto-wires spring.datasource.* — no running DB required,
 * so the suite boots offline in CI.
 */
@Testcontainers
public abstract class AbstractPostgresIT {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16-alpine");
}
