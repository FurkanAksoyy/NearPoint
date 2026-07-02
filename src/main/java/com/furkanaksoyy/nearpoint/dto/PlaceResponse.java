package com.furkanaksoyy.nearpoint.dto;

/**
 * Public API representation of a place. Decouples the wire contract from the JPA
 * entity and hides internal audit columns (createdAt/updatedAt).
 * {@code types} stays a comma-separated string to preserve the existing frontend contract.
 */
public record PlaceResponse(
        Long id,
        String placeId,
        String name,
        String vicinity,
        Double latitude,
        Double longitude,
        String types,
        Double rating,
        Integer userRatingsTotal,
        String photoReference,
        Boolean openNow,
        String priceLevel,
        Boolean wheelchairAccessible,
        Double searchLatitude,
        Double searchLongitude,
        Integer searchRadius
) {
}
