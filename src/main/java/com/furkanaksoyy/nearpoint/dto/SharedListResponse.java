package com.furkanaksoyy.nearpoint.dto;

import java.time.LocalDateTime;
import java.util.List;

public record SharedListResponse(
        String slug,
        String name,
        String kind,
        List<SharePlace> places,
        LocalDateTime createdAt
) {
}
