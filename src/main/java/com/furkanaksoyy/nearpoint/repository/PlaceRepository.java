package com.furkanaksoyy.nearpoint.repository;

import com.furkanaksoyy.nearpoint.model.Place;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PlaceRepository extends JpaRepository<Place, Long> {

    @Query("SELECT p FROM Place p WHERE p.searchLatitude = :latitude AND p.searchLongitude = :longitude "
            + "AND p.searchRadius = :radius AND p.searchQuery = :query AND p.searchCategory = :category "
            + "AND p.createdAt > :after")
    List<Place> findBySearchParameters(@Param("latitude") Double latitude,
                                       @Param("longitude") Double longitude,
                                       @Param("radius") Integer radius,
                                       @Param("query") String query,
                                       @Param("category") String category,
                                       @Param("after") LocalDateTime after);

    /** Most-searched keywords (query text → count), highest first. */
    @Query("SELECT p.searchQuery AS q, COUNT(p) AS c FROM Place p "
            + "WHERE p.searchQuery IS NOT NULL AND p.searchQuery <> '' "
            + "GROUP BY p.searchQuery ORDER BY COUNT(p) DESC")
    List<Object[]> topSearchQueries(Pageable pageable);
}