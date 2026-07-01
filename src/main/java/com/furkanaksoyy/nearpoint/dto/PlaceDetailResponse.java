package com.furkanaksoyy.nearpoint.dto;

import java.util.List;

/**
 * Rich details for a single place, fetched on demand from Places API (New)
 * Place Details when a user opens a place.
 */
public record PlaceDetailResponse(
        String placeId,
        String name,
        String formattedAddress,
        Double latitude,
        Double longitude,
        Double rating,
        Integer userRatingsTotal,
        String priceLevel,
        Boolean openNow,
        String phone,
        String website,
        String googleMapsUri,
        String editorialSummary,
        List<String> weekdayDescriptions,
        String photoReference
) {
}
