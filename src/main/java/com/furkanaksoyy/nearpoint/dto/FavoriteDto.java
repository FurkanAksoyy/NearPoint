package com.furkanaksoyy.nearpoint.dto;

import jakarta.validation.constraints.NotBlank;

/** A saved place. Used both to add a favorite and to return the user's favorites. */
public record FavoriteDto(
        @NotBlank String placeId,
        String name,
        String vicinity,
        Double latitude,
        Double longitude,
        String types,
        Double rating,
        Integer userRatingsTotal,
        String photoReference,
        String priceLevel,
        Boolean openNow
) {
}
