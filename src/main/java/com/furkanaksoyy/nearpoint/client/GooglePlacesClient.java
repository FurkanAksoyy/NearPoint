package com.furkanaksoyy.nearpoint.client;

import com.furkanaksoyy.nearpoint.config.GooglePlacesConfig;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Client for the Google Places API (New). Uses Text Search when a keyword is given
 * ("hamburger"), otherwise Nearby Search. Lives in its own bean so Resilience4j's
 * {@code @CircuitBreaker}/{@code @Retry} apply through the Spring proxy.
 */
@Component
public class GooglePlacesClient {

    private static final Logger log = LoggerFactory.getLogger(GooglePlacesClient.class);

    // Cost is controlled by the field mask — only the fields we render are requested.
    private static final String FIELD_MASK = String.join(",",
            "places.id", "places.displayName", "places.formattedAddress", "places.location",
            "places.rating", "places.userRatingCount", "places.types", "places.priceLevel",
            "places.currentOpeningHours.openNow", "places.photos");

    // Richer mask for on-demand single-place details (only billed when a user opens a place)
    private static final String DETAILS_FIELD_MASK = String.join(",",
            "id", "displayName", "formattedAddress", "location", "rating", "userRatingCount",
            "priceLevel", "currentOpeningHours.openNow", "currentOpeningHours.weekdayDescriptions",
            "nationalPhoneNumber", "websiteUri", "googleMapsUri", "editorialSummary", "photos");

    private final RestTemplate restTemplate;
    private final GooglePlacesConfig config;

    public GooglePlacesClient(RestTemplate restTemplate, GooglePlacesConfig config) {
        this.restTemplate = restTemplate;
        this.config = config;
    }

    @CircuitBreaker(name = "googlePlaces", fallbackMethod = "fallback")
    @Retry(name = "googlePlaces")
    public Map<String, Object> search(String query, String category,
                                      Double latitude, Double longitude, Integer radius, Boolean openNow) {
        boolean hasQuery = query != null && !query.isBlank();
        boolean hasCategory = category != null && !category.isBlank();

        Map<String, Object> circle = Map.of(
                "center", Map.of("latitude", latitude, "longitude", longitude),
                "radius", radius.doubleValue());

        Map<String, Object> body = new HashMap<>();
        String url;
        if (hasQuery) {
            url = config.getTextSearchUrl();
            body.put("textQuery", query);
            body.put("locationBias", Map.of("circle", circle));
            body.put("pageSize", 20);
            if (hasCategory) {
                body.put("includedType", category);
            }
            if (Boolean.TRUE.equals(openNow)) {
                body.put("openNow", true);
            }
        } else {
            url = config.getNearbySearchUrl();
            body.put("locationRestriction", Map.of("circle", circle));
            body.put("maxResultCount", 20);
            body.put("rankPreference", "POPULARITY");
            if (hasCategory) {
                body.put("includedTypes", List.of(category));
            }
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Goog-Api-Key", config.getApiKey());
        headers.set("X-Goog-FieldMask", FIELD_MASK);

        log.info("Places API ({}) query='{}' category='{}'", hasQuery ? "TextSearch" : "NearbySearch", query, category);

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response =
                (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.exchange(
                        url, HttpMethod.POST, new HttpEntity<>(body, headers), Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unused")
    private Map<String, Object> fallback(String query, String category, Double latitude, Double longitude,
                                         Integer radius, Boolean openNow, Throwable t) {
        log.warn("Places API unavailable ({}): {}", t.getClass().getSimpleName(), t.getMessage());
        return Map.of("places", List.of());
    }

    @CircuitBreaker(name = "googlePlaces", fallbackMethod = "detailsFallback")
    @Retry(name = "googlePlaces")
    public Map<String, Object> getDetails(String placeId) {
        String url = config.getDetailsUrlBase() + placeId;
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Goog-Api-Key", config.getApiKey());
        headers.set("X-Goog-FieldMask", DETAILS_FIELD_MASK);

        log.info("Places API (Details) placeId='{}'", placeId);

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response =
                (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.exchange(
                        url, HttpMethod.GET, new HttpEntity<>(headers), Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unused")
    private Map<String, Object> detailsFallback(String placeId, Throwable t) {
        log.warn("Places Details unavailable ({}): {}", t.getClass().getSimpleName(), t.getMessage());
        return Map.of();
    }
}
