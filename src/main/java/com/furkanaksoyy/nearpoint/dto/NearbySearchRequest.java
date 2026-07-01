package com.furkanaksoyy.nearpoint.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Validated query parameters for a search. {@code latitude}/{@code longitude}/{@code radius}
 * anchor the search; {@code query} (free text like "hamburger") and {@code category}
 * (a place type) are optional. When both are empty it's a plain nearby search.
 */
public record NearbySearchRequest(

        @NotNull(message = "latitude is required")
        @DecimalMin(value = "-90.0", message = "latitude must be >= -90")
        @DecimalMax(value = "90.0", message = "latitude must be <= 90")
        Double latitude,

        @NotNull(message = "longitude is required")
        @DecimalMin(value = "-180.0", message = "longitude must be >= -180")
        @DecimalMax(value = "180.0", message = "longitude must be <= 180")
        Double longitude,

        @NotNull(message = "radius is required")
        @Min(value = 1, message = "radius must be >= 1")
        @Max(value = 50000, message = "radius must be <= 50000")
        Integer radius,

        @Size(max = 200, message = "query must be at most 200 characters")
        String query,

        @Size(max = 100, message = "category must be at most 100 characters")
        String category,

        Boolean openNow
) {
}
