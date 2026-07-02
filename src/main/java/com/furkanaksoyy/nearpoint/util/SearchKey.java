package com.furkanaksoyy.nearpoint.util;

import java.util.Locale;

/**
 * Builds a stable, collision-free cache key for a place search.
 * Coordinates are bucketed to ~3 decimal places (~110 m) so that near-identical
 * searches from different users share a cache entry (raw float keys never hit).
 */
public final class SearchKey {

    private SearchKey() {
    }

    public static String of(String query, String category, Double latitude, Double longitude, Integer radius) {
        return norm(query) + '|' + norm(category) + '|'
                + bucket(latitude) + '|' + bucket(longitude) + '|'
                + (radius == null ? 0 : radius);
    }

    /** Round a coordinate to ~110 m (3 decimals). Used everywhere a coordinate is a cache/storage key. */
    public static Double round3(Double value) {
        return value == null ? null : Math.round(value * 1000.0) / 1000.0;
    }

    private static String norm(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static String bucket(Double value) {
        return value == null ? "" : String.format(Locale.ROOT, "%.3f", round3(value));
    }
}
