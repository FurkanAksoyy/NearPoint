package com.furkanaksoyy.nearpoint.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record SharePlace(
        String placeId,
        String name,
        Double latitude,
        Double longitude,
        Double rating,
        Integer userRatingsTotal,
        String priceLevel,
        String types,
        String photoReference,
        String vicinity,
        Boolean openNow
) {
}
