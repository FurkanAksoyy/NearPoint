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

    @Column(length = 1000)
    private String vicinity;

    private Double latitude;
    private Double longitude;

    @Column(length = 1000)
    private String types;

    private Double rating;

    @Column(name = "user_ratings_total")
    private Integer userRatingsTotal;

    @Column(length = 1000)
    private String photoReference;

    // Bu alan arama parametrelerini tanımlar
    private Double searchLatitude;
    private Double searchLongitude;
    private Integer searchRadius;

    // Önbellek kontrolü için
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}