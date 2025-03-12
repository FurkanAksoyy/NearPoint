package com.furkanaksoyy.nearpoint.repository;

import com.furkanaksoyy.nearpoint.model.Place;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

    @Query("SELECT p FROM Place p WHERE p.searchLatitude = :latitude AND p.searchLongitude = :longitude AND p.searchRadius = :radius")
    List<Place> findBySearchParameters(@Param("latitude") Double latitude, @Param("longitude") Double longitude, @Param("radius") Integer radius);
}