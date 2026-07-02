package com.furkanaksoyy.nearpoint.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ShareRequest(
        @Size(max = 120) String name,
        @Size(max = 20) String kind,
        @NotEmpty @Size(max = 50) List<SharePlace> places
) {
}
