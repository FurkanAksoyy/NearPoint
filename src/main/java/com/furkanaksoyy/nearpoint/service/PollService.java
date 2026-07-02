package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.dto.PollResponse;
import com.furkanaksoyy.nearpoint.dto.ShareRequest;
import com.furkanaksoyy.nearpoint.dto.SharedListResponse;
import com.furkanaksoyy.nearpoint.model.PollVote;
import com.furkanaksoyy.nearpoint.repository.PollVoteRepository;
import com.furkanaksoyy.nearpoint.repository.SharedListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class PollService {

    private final ShareService shareService;
    private final PollVoteRepository votes;
    private final SharedListRepository sharedLists;

    public PollService(ShareService shareService, PollVoteRepository votes, SharedListRepository sharedLists) {
        this.shareService = shareService;
        this.votes = votes;
        this.sharedLists = sharedLists;
    }

    /** The latest app-generated "poll of the week", or null if none yet. */
    public PollResponse featured() {
        return sharedLists.findFirstByFeaturedTrueOrderByCreatedAtDesc()
                .map(sl -> get(sl.getSlug()))
                .orElse(null);
    }

    /** A poll reuses the shared-list store (kind = "poll") for its place options. */
    public String create(ShareRequest request) {
        ShareRequest poll = new ShareRequest(request.name(), "poll", request.places());
        return shareService.create(poll, null);
    }

    public PollResponse get(String slug) {
        SharedListResponse list = shareService.get(slug); // 404 if missing
        Map<String, Long> tally = tally(slug);
        long total = tally.values().stream().mapToLong(Long::longValue).sum();
        return new PollResponse(slug, list.name(), list.places(), tally, total);
    }

    @Transactional
    public void vote(String slug, String placeId, String voter) {
        SharedListResponse list = shareService.get(slug);
        boolean valid = list.places().stream().anyMatch(p -> placeId.equals(p.placeId()));
        if (!valid) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not an option in this poll");
        }
        PollVote vote = votes.findBySlugAndVoter(slug, voter).orElseGet(PollVote::new);
        vote.setSlug(slug);
        vote.setPlaceId(placeId);
        vote.setVoter(voter);
        if (vote.getCreatedAt() == null) {
            vote.setCreatedAt(LocalDateTime.now());
        }
        votes.save(vote);
    }

    private Map<String, Long> tally(String slug) {
        Map<String, Long> result = new LinkedHashMap<>();
        for (Object[] row : votes.tally(slug)) {
            result.put((String) row[0], ((Number) row[1]).longValue());
        }
        return result;
    }
}
