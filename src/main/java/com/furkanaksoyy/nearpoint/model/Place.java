package com.furkanaksoyy.nearpoint.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "places")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Place {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String placeId;
    private String name;
    private String vicinity;
    private Double latitude;
    private Double longitude;
    private String types;
    private Double rating;

    @Column(name = "user_ratings_total")
    private Integer userRatingsTotal;

    private String photoReference;


    private Double searchLatitude;
    private Double searchLongitude;
    private Integer searchRadius;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
