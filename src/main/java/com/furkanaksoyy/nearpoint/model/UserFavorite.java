package com.furkanaksoyy.nearpoint.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_favorites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String placeId;
    private String name;

    @Column(length = 1000)
    private String vicinity;

    private Double latitude;
    private Double longitude;

    @Column(length = 1000)
    private String types;

    private Double rating;
    private Integer userRatingsTotal;

    @Column(length = 1000)
    private String photoReference;

    private String priceLevel;
    private Boolean openNow;
    private LocalDateTime createdAt;
}
