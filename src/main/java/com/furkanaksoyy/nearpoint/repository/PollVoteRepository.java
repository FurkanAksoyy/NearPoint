package com.furkanaksoyy.nearpoint.repository;

import com.furkanaksoyy.nearpoint.model.PollVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PollVoteRepository extends JpaRepository<PollVote, Long> {

    Optional<PollVote> findBySlugAndVoter(String slug, String voter);

    @Query("SELECT v.placeId AS placeId, COUNT(v) AS c FROM PollVote v WHERE v.slug = :slug GROUP BY v.placeId")
    List<Object[]> tally(@Param("slug") String slug);
}
