package com.furkanaksoyy.nearpoint.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI nearPointOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("NearPoint API")
                        .version("v1")
                        .description("Discover places near a coordinate. Cached in PostgreSQL + Caffeine, "
                                + "resilient Google Places calls, optional API-key auth and rate limiting.")
                        .license(new License().name("MIT")))
                .components(new Components()
                        .addSecuritySchemes("ApiKey", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name("X-API-Key")));
    }
}
