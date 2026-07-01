package com.furkanaksoyy.nearpoint.dto;

public record ReviewDto(
        String authorName,
        String authorPhotoUri,
        Double rating,
        String text,
        String relativeTime
) {
}
