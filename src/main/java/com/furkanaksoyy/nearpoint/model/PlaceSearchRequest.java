package com.furkanaksoyy.nearpoint.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlaceSearchRequest {
    private Double latitude;
    private Double longitude;
    private Integer radius;
}