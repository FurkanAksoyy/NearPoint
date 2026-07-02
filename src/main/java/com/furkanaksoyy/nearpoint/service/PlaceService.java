package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.client.GooglePlacesClient;
import com.furkanaksoyy.nearpoint.dto.AutocompleteSuggestion;
import com.furkanaksoyy.nearpoint.dto.PlaceDetailResponse;
import com.furkanaksoyy.nearpoint.dto.PlaceResponse;
import com.furkanaksoyy.nearpoint.dto.ReviewDto;
import com.furkanaksoyy.nearpoint.mapper.PlaceMapper;
import com.furkanaksoyy.nearpoint.model.Place;
import com.furkanaksoyy.nearpoint.repository.PlaceRepository;
import com.furkanaksoyy.nearpoint.util.SearchKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final long cacheTtlHours;

    public PlaceService(PlaceRepository placeRepository,
                        GooglePlacesClient googlePlacesClient,
                        PlaceMapper placeMapper,
                        @org.springframework.beans.factory.annotation.Value("${google.places.cache-ttl-hours:24}") long cacheTtlHours) {
        this.placeRepository = placeRepository;
        this.googlePlacesClient = googlePlacesClient;
        this.placeMapper = placeMapper;
        this.cacheTtlHours = cacheTtlHours;
    }

    /**
     * Search places by optional keyword/category near a coordinate.
     * Two-level cache: Caffeine (TTL) in front of the durable Postgres cache, keyed by the
     * full search (query + category + location + radius). Empty results are not cached.
     */
    @Cacheable(cacheNames = "nearbyPlaces",
            key = "T(com.furkanaksoyy.nearpoint.util.SearchKey).of(#query, #category, #latitude, #longitude, #radius)",
            unless = "#result == null || #result.isEmpty()")
    @Transactional
    public List<PlaceResponse> search(String query, String category,
                                      Double latitude, Double longitude, Integer radius) {
        String q = normalize(query);
        String cat = normalize(category);
        // Bucket the location once (~110 m) so Caffeine, the Postgres cache lookup, and storage
        // all share the same key — otherwise GPS jitter makes the DB cache miss and re-bill Google.
        Double bLat = SearchKey.round3(latitude);
        Double bLng = SearchKey.round3(longitude);

        List<Place> existing = placeRepository.findBySearchParameters(
                bLat, bLng, radius, q, cat, LocalDateTime.now().minusHours(cacheTtlHours));
        if (!existing.isEmpty()) {
            log.debug("DB cache hit for q='{}' cat='{}' ({}, {}, {}) -> {}", q, cat, bLat, bLng, radius, existing.size());
            return placeMapper.toResponseList(existing);
        }

        // Query Google with the precise location for the best results...
        Map<String, Object> body = googlePlacesClient.search(query, category, latitude, longitude, radius);
        // ...but store against the bucketed key so future nearby searches hit the cache.
        List<Place> places = parsePlaces(body, q, cat, bLat, bLng, radius);

        if (!places.isEmpty()) {
            // Clear any stale rows for this exact search before inserting a fresh set (no unbounded growth).
            placeRepository.deleteBySearchParameters(bLat, bLng, radius, q, cat);
            placeRepository.saveAll(places);
            log.info("Saved {} places for q='{}' cat='{}' ({}, {}, {})", places.size(), q, cat, bLat, bLng, radius);
        }
        return placeMapper.toResponseList(places);
    }

    /** Paginated browse over everything stored so far. */
    public Page<PlaceResponse> getStoredPlaces(Pageable pageable) {
        return placeRepository.findAll(pageable).map(placeMapper::toResponse);
    }

    /** Search-as-you-type suggestions. Cached (short input is skipped) to cut per-keystroke Google cost. */
    @Cacheable(cacheNames = "autocomplete",
            key = "T(com.furkanaksoyy.nearpoint.util.SearchKey).of(#input, null, #latitude, #longitude, 0)",
            unless = "#result == null || #result.isEmpty()")
    @SuppressWarnings("unchecked")
    public List<AutocompleteSuggestion> autocomplete(String input, Double latitude, Double longitude) {
        if (input == null || input.trim().length() < 2) {
            return List.of();
        }
        Map<String, Object> body = googlePlacesClient.autocomplete(input.trim(), latitude, longitude);
        List<Map<String, Object>> suggestions = body == null ? null
                : (List<Map<String, Object>>) body.get("suggestions");
        if (suggestions == null) {
            return List.of();
        }
        List<AutocompleteSuggestion> out = new ArrayList<>();
        for (Map<String, Object> s : suggestions) {
            Map<String, Object> pred = (Map<String, Object>) s.get("placePrediction");
            if (pred == null) {
                continue;
            }
            Map<String, Object> text = (Map<String, Object>) pred.get("text");
            String label = text != null ? (String) text.get("text") : null;
            if (label != null) {
                out.add(new AutocompleteSuggestion(label, (String) pred.get("placeId")));
            }
            if (out.size() >= 6) {
                break;
            }
        }
        return out;
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
        List<ReviewDto> reviews = parseReviews((List<Map<String, Object>>) d.get("reviews"));

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
                photos != null && !photos.isEmpty() ? (String) photos.get(0).get("name") : null,
                reviews
        );
    }

    @SuppressWarnings("unchecked")
    private List<ReviewDto> parseReviews(List<Map<String, Object>> reviews) {
        if (reviews == null) {
            return List.of();
        }
        List<ReviewDto> result = new ArrayList<>();
        for (Map<String, Object> r : reviews) {
            if (result.size() >= 4) {
                break;
            }
            Map<String, Object> text = (Map<String, Object>) r.get("text");
            Map<String, Object> author = (Map<String, Object>) r.get("authorAttribution");
            result.add(new ReviewDto(
                    author != null ? (String) author.get("displayName") : null,
                    author != null ? (String) author.get("photoUri") : null,
                    r.get("rating") != null ? ((Number) r.get("rating")).doubleValue() : null,
                    text != null ? (String) text.get("text") : null,
                    (String) r.get("relativePublishTimeDescription")
            ));
        }
        return result;
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

            Map<String, Object> access = (Map<String, Object>) result.get("accessibilityOptions");
            if (access != null && access.get("wheelchairAccessibleEntrance") != null) {
                place.setWheelchairAccessible((Boolean) access.get("wheelchairAccessibleEntrance"));
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
