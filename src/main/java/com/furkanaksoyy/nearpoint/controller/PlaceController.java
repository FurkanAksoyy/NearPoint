package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.dto.AutocompleteSuggestion;
import com.furkanaksoyy.nearpoint.dto.NearbySearchRequest;
import com.furkanaksoyy.nearpoint.dto.PlaceDetailResponse;
import com.furkanaksoyy.nearpoint.dto.PlaceResponse;
import com.furkanaksoyy.nearpoint.service.PlaceService;
import com.furkanaksoyy.nearpoint.service.TurnstileService;
import com.furkanaksoyy.nearpoint.util.ClientIpResolver;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@Tag(name = "Places", description = "Search and browse nearby places")
public class PlaceController {

    private final PlaceService placeService;
    private final TurnstileService turnstileService;

    public PlaceController(PlaceService placeService, TurnstileService turnstileService) {
        this.placeService = placeService;
        this.turnstileService = turnstileService;
    }

    @Operation(summary = "Search places near a coordinate",
            description = "Keyword (e.g. 'hamburger') and/or category search within the given radius (meters). "
                    + "Guarded by Cloudflare Turnstile when configured.")
    @GetMapping("/nearby")
    public ResponseEntity<List<PlaceResponse>> getNearbyPlaces(
            @Valid NearbySearchRequest request,
            @RequestHeader(value = "CF-Turnstile-Token", required = false) String turnstileToken,
            HttpServletRequest httpRequest) {

        if (!turnstileService.verify(turnstileToken, ClientIpResolver.resolve(httpRequest))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<PlaceResponse> places = placeService.search(
                request.query(), request.category(),
                request.latitude(), request.longitude(), request.radius());
        return ResponseEntity.ok(places);
    }

    @Operation(summary = "Search-as-you-type suggestions")
    @GetMapping("/autocomplete")
    public List<AutocompleteSuggestion> autocomplete(
            @RequestParam String input,
            @RequestParam Double latitude,
            @RequestParam Double longitude) {
        return placeService.autocomplete(input, latitude, longitude);
    }

    @Operation(summary = "Rich details for one place",
            description = "On-demand details (hours, phone, website, summary) from Places API (New).")
    @GetMapping("/details/{placeId}")
    public ResponseEntity<PlaceDetailResponse> getDetails(@PathVariable String placeId) {
        PlaceDetailResponse details = placeService.getDetails(placeId);
        return details != null ? ResponseEntity.ok(details) : ResponseEntity.notFound().build();
    }

    @Operation(summary = "Browse stored places (paginated)",
            description = "Returns a page over all places NearPoint has cached from previous searches.")
    @GetMapping
    public Page<PlaceResponse> listStoredPlaces(@ParameterObject Pageable pageable) {
        return placeService.getStoredPlaces(pageable);
    }
}
