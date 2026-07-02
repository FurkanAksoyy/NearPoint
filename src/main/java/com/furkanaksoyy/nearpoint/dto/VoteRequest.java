package com.furkanaksoyy.nearpoint.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VoteRequest(
        @NotBlank @Size(max = 255) String placeId,
        @NotBlank @Size(max = 64) String voter
) {
}
