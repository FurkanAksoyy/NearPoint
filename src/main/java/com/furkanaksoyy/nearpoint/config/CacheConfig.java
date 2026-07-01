package com.furkanaksoyy.nearpoint.config;

import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Configuration;

/**
 * Enables Spring's caching. The Caffeine cache manager (spec + cache names) is
 * auto-configured from {@code spring.cache.*} in application.yml.
 */
@Configuration
@EnableCaching
public class CacheConfig {
}
