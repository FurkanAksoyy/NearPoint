package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.dto.PlaceResponse;
import com.furkanaksoyy.nearpoint.dto.SharePlace;
import com.furkanaksoyy.nearpoint.dto.ShareRequest;
import com.furkanaksoyy.nearpoint.model.SharedList;
import com.furkanaksoyy.nearpoint.repository.SharedListRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Auto-generates a "poll of the week" from real top places in a rotating Istanbul
 * neighbourhood, so there's always a fresh, shareable poll on the home page.
 * The share/distribution step is still human — this just removes the create friction.
 */
@Service
public class FeaturedPollService {

    private static final Logger log = LoggerFactory.getLogger(FeaturedPollService.class);

    private record Combo(String question, String query, String category, double lat, double lng) { }

    private static final List<Combo> COMBOS = List.of(
            new Combo("Kadıköy'ün en iyi hamburgeri?", "hamburger", null, 40.9903, 29.0275),
            new Combo("Moda'nın en iyi kahvecisi?", null, "cafe", 40.9810, 29.0265),
            new Combo("Beşiktaş'ın en iyi pizzacısı?", "pizza", null, 41.0422, 29.0083),
            new Combo("Karaköy'ün en iyi restoranı?", null, "restaurant", 41.0256, 28.9741),
            new Combo("Beyoğlu'nun en iyi barı?", null, "bar", 41.0369, 28.9770),
            new Combo("Nişantaşı'nın en iyi kahvecisi?", null, "cafe", 41.0479, 28.9936),
            new Combo("Şişli'nin en iyi hamburgeri?", "hamburger", null, 41.0602, 28.9877),
            new Combo("Beşiktaş'ın en iyi kahvecisi?", null, "cafe", 41.0422, 29.0083)
    );

    private final PlaceService placeService;
    private final PollService pollService;
    private final SharedListRepository sharedLists;

    public FeaturedPollService(PlaceService placeService, PollService pollService, SharedListRepository sharedLists) {
        this.placeService = placeService;
        this.pollService = pollService;
        this.sharedLists = sharedLists;
    }

    /** Every Monday 09:00 (server time). Cron overridable via app.featured-poll.cron. */
    @Scheduled(cron = "${app.featured-poll.cron:0 0 9 * * MON}")
    public void weekly() {
        try {
            generate();
        } catch (Exception e) {
            log.warn("Featured poll generation failed: {}", e.getMessage());
        }
    }

    /** Build one featured poll from the current week's neighbourhood. Returns the slug, or null. */
    public String generate() {
        int week = LocalDate.now().get(WeekFields.of(Locale.ROOT).weekOfWeekBasedYear());
        Combo c = COMBOS.get(Math.floorMod(week, COMBOS.size()));

        List<PlaceResponse> results = placeService.search(c.query(), c.category(), c.lat(), c.lng(), 2000);
        List<SharePlace> options = results.stream()
                .filter(p -> p.rating() != null && p.rating() >= 4.0
                        && p.userRatingsTotal() != null && p.userRatingsTotal() >= 50)
                .sorted(Comparator.comparingDouble((PlaceResponse p) -> p.rating()).reversed())
                .limit(4)
                .map(this::toShare)
                .toList();

        if (options.size() < 2) {
            log.info("Not enough options for featured poll '{}'", c.question());
            return null;
        }

        String slug = pollService.create(new ShareRequest(c.question(), "poll", options));
        sharedLists.findBySlug(slug).ifPresent(sl -> {
            sl.setFeatured(true);
            sharedLists.save(sl);
        });
        log.info("Created featured poll '{}' -> {}", c.question(), slug);
        return slug;
    }

    private SharePlace toShare(PlaceResponse p) {
        return new SharePlace(p.placeId(), p.name(), p.latitude(), p.longitude(), p.rating(),
                p.userRatingsTotal(), p.priceLevel(), p.types(), p.photoReference(), p.vicinity(), p.openNow());
    }
}
