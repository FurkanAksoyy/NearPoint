package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.client.GooglePlacesClient;
import com.furkanaksoyy.nearpoint.dto.PlaceDetailResponse;
import com.furkanaksoyy.nearpoint.dto.PlaceResponse;
import com.furkanaksoyy.nearpoint.mapper.PlaceMapper;
import com.furkanaksoyy.nearpoint.model.Place;
import com.furkanaksoyy.nearpoint.repository.PlaceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PlaceService {

    private static final Logger log = LoggerFactory.getLogger(PlaceService.class);

    private final PlaceRepository placeRepository;
    private final GooglePlacesClient googlePlacesClient;
    private final PlaceMapper placeMapper;

    public PlaceService(PlaceRepository placeRepository,
                        GooglePlacesClient googlePlacesClient,
                        PlaceMapper placeMapper) {
        this.placeRepository = placeRepository;
        this.googlePlacesClient = googlePlacesClient;
        this.placeMapper = placeMapper;
    }

    /**
     * Search places by optional keyword/category near a coordinate.
     * Two-level cache: Caffeine (TTL) in front of the durable Postgres cache, keyed by the
     * full search (query + category + location + radius). Empty results are not cached.
     */
    @Cacheable(cacheNames = "nearbyPlaces",
            key = "T(java.util.Objects).hash(#query, #category, #latitude, #longitude, #radius)",
            unless = "#result == null || #result.isEmpty()")
    public List<PlaceResponse> search(String query, String category,
                                      Double latitude, Double longitude, Integer radius, Boolean openNow) {
        String q = normalize(query);
        String cat = normalize(category);

        List<Place> existing = placeRepository.findBySearchParameters(latitude, longitude, radius, q, cat);
        if (!existing.isEmpty()) {
            log.debug("DB cache hit for q='{}' cat='{}' ({}, {}, {}) -> {}", q, cat, latitude, longitude, radius, existing.size());
            return placeMapper.toResponseList(existing);
        }

        Map<String, Object> body = googlePlacesClient.search(query, category, latitude, longitude, radius, openNow);
        List<Place> places = parsePlaces(body, q, cat, latitude, longitude, radius);

        if (!places.isEmpty()) {
            placeRepository.saveAll(places);
            log.info("Saved {} places for q='{}' cat='{}' ({}, {}, {})", places.size(), q, cat, latitude, longitude, radius);
        }
        return placeMapper.toResponseList(places);
    }

    /** Paginated browse over everything stored so far. */
    public Page<PlaceResponse> getStoredPlaces(Pageable pageable) {
        return placeRepository.findAll(pageable).map(placeMapper::toResponse);
    }

    /** On-demand rich details for a single place (cached; billed only when a user opens a place). */
    @Cacheable(cacheNames = "placeDetails", key = "#placeId", unless = "#result == null")
    @SuppressWarnings("unchecked")
    public PlaceDetailResponse getDetails(String placeId) {
        Map<String, Object> d = googlePlacesClient.getDetails(placeId);
        if (d == null || d.get("id") == null) {
            return null;
        }

        Map<String, Object> displayName = (Map<String, Object>) d.get("displayName");
        Map<String, Object> location = (Map<String, Object>) d.get("location");
        Map<String, Object> hours = (Map<String, Object>) d.get("currentOpeningHours");
        Map<String, Object> summary = (Map<String, Object>) d.get("editorialSummary");
        List<Map<String, Object>> photos = (List<Map<String, Object>>) d.get("photos");

        return new PlaceDetailResponse(
                (String) d.get("id"),
                displayName != null ? (String) displayName.get("text") : null,
                (String) d.get("formattedAddress"),
                location != null ? asDouble(location.get("latitude")) : null,
                location != null ? asDouble(location.get("longitude")) : null,
                d.get("rating") != null ? ((Number) d.get("rating")).doubleValue() : null,
                d.get("userRatingCount") != null ? ((Number) d.get("userRatingCount")).intValue() : null,
                d.get("priceLevel") != null ? d.get("priceLevel").toString() : null,
                hours != null ? (Boolean) hours.get("openNow") : null,
                (String) d.get("nationalPhoneNumber"),
                (String) d.get("websiteUri"),
                (String) d.get("googleMapsUri"),
                summary != null ? (String) summary.get("text") : null,
                hours != null ? (List<String>) hours.get("weekdayDescriptions") : null,
                photos != null && !photos.isEmpty() ? (String) photos.get(0).get("name") : null
        );
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    @SuppressWarnings("unchecked")
    private List<Place> parsePlaces(Map<String, Object> body, String query, String category,
                                    Double latitude, Double longitude, Integer radius) {
        List<Place> places = new ArrayList<>();
        if (body == null) {
            return places;
        }
        List<Map<String, Object>> results = (List<Map<String, Object>>) body.get("places");
        if (results == null || results.isEmpty()) {
            return places;
        }

        LocalDateTime now = LocalDateTime.now();
        for (Map<String, Object> result : results) {
            Place place = new Place();
            place.setPlaceId((String) result.get("id"));

            Map<String, Object> displayName = (Map<String, Object>) result.get("displayName");
            if (displayName != null) {
                place.setName((String) displayName.get("text"));
            }
            place.setVicinity((String) result.get("formattedAddress"));

            Map<String, Object> location = (Map<String, Object>) result.get("location");
            if (location != null) {
                place.setLatitude(asDouble(location.get("latitude")));
                place.setLongitude(asDouble(location.get("longitude")));
            }

            if (result.get("types") != null) {
                place.setTypes(String.join(",", (List<String>) result.get("types")));
            }
            if (result.get("rating") != null) {
                place.setRating(((Number) result.get("rating")).doubleValue());
            }
            if (result.get("userRatingCount") != null) {
                place.setUserRatingsTotal(((Number) result.get("userRatingCount")).intValue());
            }
            if (result.get("priceLevel") != null) {
                place.setPriceLevel(result.get("priceLevel").toString());
            }

            Map<String, Object> hours = (Map<String, Object>) result.get("currentOpeningHours");
            if (hours != null && hours.get("openNow") != null) {
                place.setOpenNow((Boolean) hours.get("openNow"));
            }

            List<Map<String, Object>> photos = (List<Map<String, Object>>) result.get("photos");
            if (photos != null && !photos.isEmpty()) {
                place.setPhotoReference((String) photos.get(0).get("name"));
            }

            place.setSearchLatitude(latitude);
            place.setSearchLongitude(longitude);
            place.setSearchRadius(radius);
            place.setSearchQuery(query);
            place.setSearchCategory(category);
            place.setCreatedAt(now);
            place.setUpdatedAt(now);

            places.add(place);
        }
        return places;
    }

    private Double asDouble(Object value) {
        return value == null ? null : ((Number) value).doubleValue();
    }
}
