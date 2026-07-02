package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.dto.PollResponse;
import com.furkanaksoyy.nearpoint.dto.ShareRequest;
import com.furkanaksoyy.nearpoint.dto.VoteRequest;
import com.furkanaksoyy.nearpoint.service.PollService;
import com.furkanaksoyy.nearpoint.util.ClientIpResolver;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/poll")
@Tag(name = "Poll", description = "Group 'where should we go' polls (login-free voting)")
public class PollController {

    private final PollService pollService;

    public PollController(PollService pollService) {
        this.pollService = pollService;
    }

    @PostMapping
    public Map<String, String> create(@Valid @RequestBody ShareRequest request) {
        return Map.of("slug", pollService.create(request));
    }

    @GetMapping("/featured")
    public ResponseEntity<PollResponse> featured() {
        PollResponse poll = pollService.featured();
        return poll != null ? ResponseEntity.ok(poll) : ResponseEntity.noContent().build();
    }

    @GetMapping("/{slug}")
    public PollResponse get(@PathVariable String slug) {
        return pollService.get(slug);
    }

    @PostMapping("/{slug}/vote")
    public PollResponse vote(@PathVariable String slug, @Valid @RequestBody VoteRequest request,
                             HttpServletRequest httpRequest) {
        pollService.vote(slug, request.placeId(), request.voter(), ClientIpResolver.resolve(httpRequest));
        return pollService.get(slug);
    }
}
