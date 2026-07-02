package com.furkanaksoyy.nearpoint.dto;

import java.util.List;
import java.util.Map;

public record PollResponse(
        String slug,
        String name,
        List<SharePlace> places,
        Map<String, Long> votes,
        long totalVotes
) {
}
