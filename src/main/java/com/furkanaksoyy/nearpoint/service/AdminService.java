package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.dto.AdminStatsResponse;
import com.furkanaksoyy.nearpoint.dto.AdminStatsResponse.SearchCount;
import com.furkanaksoyy.nearpoint.repository.PlaceRepository;
import com.furkanaksoyy.nearpoint.repository.PushSubscriptionRepository;
import com.furkanaksoyy.nearpoint.repository.SharedListRepository;
import com.furkanaksoyy.nearpoint.repository.UserFavoriteRepository;
import com.furkanaksoyy.nearpoint.repository.UserRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final UserRepository users;
    private final UserFavoriteRepository favorites;
    private final SharedListRepository sharedLists;
    private final PushSubscriptionRepository pushSubs;
    private final PlaceRepository places;
    private final MeterRegistry registry;

    public AdminService(UserRepository users, UserFavoriteRepository favorites,
                        SharedListRepository sharedLists, PushSubscriptionRepository pushSubs,
                        PlaceRepository places, MeterRegistry registry) {
        this.users = users;
        this.favorites = favorites;
        this.sharedLists = sharedLists;
        this.pushSubs = pushSubs;
        this.places = places;
        this.registry = registry;
    }

    /** Admin status is stored in the DB (users.role), never in the repo/config. */
    public boolean isAdmin(Long userId) {
        return userId != null && users.findById(userId)
                .map(u -> "ADMIN".equals(u.getRole()))
                .orElse(false);
    }

    public AdminStatsResponse stats() {
        long http = Math.round(registry.find("http.server.requests").timers().stream()
                .mapToDouble(Timer::count).sum());
        long google = Math.round(registry.find("nearpoint.google.calls").counters().stream()
                .mapToDouble(Counter::count).sum());

        List<SearchCount> topSearches = places.topSearchQueries(PageRequest.of(0, 10)).stream()
                .map(r -> new SearchCount((String) r[0], ((Number) r[1]).longValue()))
                .toList();

        return new AdminStatsResponse(
                users.count(), favorites.count(), sharedLists.count(),
                pushSubs.count(), places.count(), http, google, topSearches);
    }
}
