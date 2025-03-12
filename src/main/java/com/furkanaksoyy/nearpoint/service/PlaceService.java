package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.config.GooglePlacesConfig;
import com.furkanaksoyy.nearpoint.model.Place;
import com.furkanaksoyy.nearpoint.repository.PlaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class PlaceService {

    private final PlaceRepository placeRepository;
    private final RestTemplate restTemplate;
    private final GooglePlacesConfig googlePlacesConfig;
    private final String PLACES_API_URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

    @Autowired
    public PlaceService(PlaceRepository placeRepository, RestTemplate restTemplate, GooglePlacesConfig googlePlacesConfig) {
        this.placeRepository = placeRepository;
        this.restTemplate = restTemplate;
        this.googlePlacesConfig = googlePlacesConfig;
    }

    public List<Place> getNearbyPlaces(Double latitude, Double longitude, Integer radius) {
        //  First check if there is a record in the database for the same query
        List<Place> existingPlaces = placeRepository.findBySearchParameters(latitude, longitude, radius);

        if (!existingPlaces.isEmpty()) {
            return existingPlaces;
        }

        // If not in database, pull from Google Places API
        String url = UriComponentsBuilder.fromHttpUrl(PLACES_API_URL)
                .queryParam("location", latitude + "," + longitude)
                .queryParam("radius", radius)
                .queryParam("key", googlePlacesConfig.getApiKey())
                .toUriString();

        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");

        List<Place> places = new ArrayList<>();
        for (Map<String, Object> result : results) {
            Place place = new Place();
            place.setPlaceId((String) result.get("place_id"));
            place.setName((String) result.get("name"));
            place.setVicinity((String) result.get("vicinity"));

            Map<String, Double> location = (Map<String, Double>) ((Map<String, Object>) result.get("geometry")).get("location");
            place.setLatitude(location.get("lat"));
            place.setLongitude(location.get("lng"));

            if (result.get("types") != null) {
                place.setTypes(String.join(",", (List<String>) result.get("types")));
            }

            if (result.get("rating") != null) {
                place.setRating(((Number) result.get("rating")).doubleValue());
            }

            if (result.get("user_ratings_total") != null) {
                place.setUserRatingsTotal(((Number) result.get("user_ratings_total")).intValue());
            }

            if (result.get("photos") != null) {
                List<Map<String, Object>> photos = (List<Map<String, Object>>) result.get("photos");
                if (!photos.isEmpty()) {
                    place.setPhotoReference((String) photos.get(0).get("photo_reference"));
                }
            }

            // Save search parameters
            place.setSearchLatitude(latitude);
            place.setSearchLongitude(longitude);
            place.setSearchRadius(radius);

            // Timestamp
            place.setCreatedAt(LocalDateTime.now());
            place.setUpdatedAt(LocalDateTime.now());

            places.add(place);
        }

        // Save to database
        placeRepository.saveAll(places);

        return places;
    }
}