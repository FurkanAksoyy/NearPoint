package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.AbstractPostgresIT;
import com.furkanaksoyy.nearpoint.dto.PlaceResponse;
import com.furkanaksoyy.nearpoint.repository.PlaceRepository;
import com.github.tomakehurst.wiremock.WireMockServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.util.List;

import static com.github.tomakehurst.wiremock.client.WireMock.okJson;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.postRequestedFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathEqualTo;
import static com.github.tomakehurst.wiremock.core.WireMockConfiguration.options;
import static org.assertj.core.api.Assertions.assertThat;

/**
 * Full-context integration test: real PostgreSQL (Testcontainers) + mocked Places API
 * (New) via WireMock. Verifies keyword fetch → parse → persist → cache, and empty results.
 */
@SpringBootTest
class PlaceServiceIT extends AbstractPostgresIT {

    private static WireMockServer wireMock;

    @Autowired
    private PlaceService placeService;
    @Autowired
    private PlaceRepository placeRepository;
    @Autowired
    private CacheManager cacheManager;

    @BeforeAll
    static void startWireMock() {
        wireMock = new WireMockServer(options().dynamicPort());
        wireMock.start();
    }

    @AfterAll
    static void stopWireMock() {
        wireMock.stop();
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        String base = "http://localhost:" + wireMock.port();
        registry.add("google.places.api.text-search-url", () -> base + "/v1/places:searchText");
        registry.add("google.places.api.nearby-search-url", () -> base + "/v1/places:searchNearby");
        registry.add("google.places.api.key", () -> "test-key");
    }

    @BeforeEach
    void reset() {
        wireMock.resetAll();
        placeRepository.deleteAll();
        var cache = cacheManager.getCache("nearbyPlaces");
        if (cache != null) {
            cache.clear();
        }
    }

    @Test
    void keywordSearchFetchesParsesPersistsThenCaches() {
        wireMock.stubFor(post(urlPathEqualTo("/v1/places:searchText"))
                .willReturn(okJson("""
                        {
                          "places": [
                            {
                              "id": "p1",
                              "displayName": { "text": "Test Burger" },
                              "formattedAddress": "Main St 1",
                              "location": { "latitude": 41.03, "longitude": 28.98 },
                              "types": ["hamburger_restaurant", "restaurant"],
                              "rating": 4.7,
                              "userRatingCount": 250,
                              "priceLevel": "PRICE_LEVEL_MODERATE",
                              "currentOpeningHours": { "openNow": true },
                              "photos": [ { "name": "places/p1/photos/abc" } ]
                            }
                          ]
                        }
                        """)));

        List<PlaceResponse> first = placeService.search("hamburger", null, 41.0370, 28.9851, 1500, null);
        assertThat(first).hasSize(1);
        PlaceResponse p = first.get(0);
        assertThat(p.name()).isEqualTo("Test Burger");
        assertThat(p.types()).isEqualTo("hamburger_restaurant,restaurant");
        assertThat(p.openNow()).isTrue();
        assertThat(p.priceLevel()).isEqualTo("PRICE_LEVEL_MODERATE");
        assertThat(p.photoReference()).isEqualTo("places/p1/photos/abc");
        assertThat(placeRepository.count()).isEqualTo(1);

        // Same search again → served from cache/DB, no extra upstream request
        List<PlaceResponse> second = placeService.search("hamburger", null, 41.0370, 28.9851, 1500, null);
        assertThat(second).hasSize(1);
        wireMock.verify(1, postRequestedFor(urlPathEqualTo("/v1/places:searchText")));
    }

    @Test
    void nearbySearchWithNoResultsReturnsEmpty() {
        wireMock.stubFor(post(urlPathEqualTo("/v1/places:searchNearby"))
                .willReturn(okJson("{ \"places\": [] }")));

        assertThat(placeService.search("", null, 10.0, 10.0, 500, null)).isEmpty();
        assertThat(placeRepository.count()).isZero();
    }
}
