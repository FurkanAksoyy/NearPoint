package com.furkanaksoyy.nearpoint.repository;

import com.furkanaksoyy.nearpoint.model.Place;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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

    /** Remove any cached rows for a search before re-inserting a fresh set (prevents duplicate accumulation). */
    @Modifying
    @Query("DELETE FROM Place p WHERE p.searchLatitude = :latitude AND p.searchLongitude = :longitude "
            + "AND p.searchRadius = :radius AND p.searchQuery = :query AND p.searchCategory = :category")
    void deleteBySearchParameters(@Param("latitude") Double latitude,
                                  @Param("longitude") Double longitude,
                                  @Param("radius") Integer radius,
                                  @Param("query") String query,
                                  @Param("category") String category);

    /** Distinct places cached (rows are per-search results, so count unique place ids). */
    @Query("SELECT COUNT(DISTINCT p.placeId) FROM Place p")
    long countDistinctPlaces();

    /** Most-searched keywords by distinct places surfaced (not raw result rows), highest first. */
    @Query("SELECT p.searchQuery AS q, COUNT(DISTINCT p.placeId) AS c FROM Place p "
            + "WHERE p.searchQuery IS NOT NULL AND p.searchQuery <> '' "
            + "GROUP BY p.searchQuery ORDER BY COUNT(DISTINCT p.placeId) DESC")
    List<Object[]> topSearchQueries(Pageable pageable);
}