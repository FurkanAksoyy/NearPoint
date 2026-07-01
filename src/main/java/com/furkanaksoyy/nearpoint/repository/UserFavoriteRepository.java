package com.furkanaksoyy.nearpoint.repository;

import com.furkanaksoyy.nearpoint.model.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
    List<UserFavorite> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndPlaceId(Long userId, String placeId);
    long deleteByUserIdAndPlaceId(Long userId, String placeId);
}
