package com.furkanaksoyy.nearpoint.repository;

import com.furkanaksoyy.nearpoint.model.SharedList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SharedListRepository extends JpaRepository<SharedList, Long> {
    Optional<SharedList> findBySlug(String slug);
    boolean existsBySlug(String slug);
    Optional<SharedList> findFirstByFeaturedTrueOrderByCreatedAtDesc();
    long countByKind(String kind);
}
