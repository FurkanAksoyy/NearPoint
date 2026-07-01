package com.furkanaksoyy.nearpoint.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GooglePlacesConfig {

    @Value("${google.places.api.key}")
    private String apiKey;

    @Value("${google.places.api.text-search-url}")
    private String textSearchUrl;

    @Value("${google.places.api.nearby-search-url}")
    private String nearbySearchUrl;

    @Value("${google.places.api.details-url-base}")
    private String detailsUrlBase;

    @Value("${google.places.api.autocomplete-url}")
    private String autocompleteUrl;

    @Bean
    public RestTemplate restTemplate() {
        // HTTP/1.1 via HttpURLConnection (avoids JDK-HttpClient HTTP/2 quirks with some servers),
        // with bounded timeouts so a slow/hanging upstream trips Resilience4j instead of blocking threads.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2000);
        factory.setReadTimeout(3000);
        return new RestTemplate(factory);
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getTextSearchUrl() {
        return textSearchUrl;
    }

    public String getNearbySearchUrl() {
        return nearbySearchUrl;
    }

    public String getDetailsUrlBase() {
        return detailsUrlBase;
    }

    public String getAutocompleteUrl() {
        return autocompleteUrl;
    }
}
