package com.furkanaksoyy.nearpoint.dto;

import java.util.List;

public record AdminStatsResponse(
        long users,
        long favorites,
        long sharedLists,
        long pushSubscriptions,
        long placesCached,
        long polls,
        long pollVotes,
        long httpRequests,
        long googleApiCalls,
        long uptimeSeconds,
        List<SearchCount> topSearches
) {
    public record SearchCount(String query, long count) {
    }
}
