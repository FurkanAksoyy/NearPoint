package com.furkanaksoyy.nearpoint.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Warms the durable place cache for the /near SEO landing pages so crawler sweeps render
 * instantly and don't each re-bill Google. Runs weekly; keep the set aligned with nearData.js.
 */
@Service
public class NearWarmerService {

    private static final Logger log = LoggerFactory.getLogger(NearWarmerService.class);

    private record Loc(double lat, double lng) { }
    private record Cat(String query, String category) { }

    private static final List<Loc> LOCATIONS = List.of(
            new Loc(41.0082, 28.9784),   // İstanbul
            new Loc(40.9903, 29.0275),   // Kadıköy
            new Loc(41.0422, 29.0083),   // Beşiktaş
            new Loc(41.0602, 28.9877),   // Şişli
            new Loc(41.0369, 28.9770),   // Beyoğlu
            new Loc(41.0233, 29.0152),   // Üsküdar
            new Loc(40.9810, 29.0265),   // Moda
            new Loc(41.0256, 28.9741),   // Karaköy
            new Loc(41.0479, 28.9936),   // Nişantaşı
            new Loc(39.9334, 32.8597),   // Ankara
            new Loc(38.4237, 27.1428),   // İzmir
            new Loc(36.8969, 30.7133),   // Antalya
            new Loc(40.1826, 29.0665),   // Bursa
            new Loc(37.0000, 35.3213)    // Adana
    );

    private static final List<Cat> CATEGORIES = List.of(
            new Cat("hamburger", null),
            new Cat("pizza", null),
            new Cat(null, "cafe"),
            new Cat(null, "restaurant"),
            new Cat(null, "bar"),
            new Cat(null, "lodging"),
            new Cat(null, "tourist_attraction")
    );

    private final PlaceService placeService;

    public NearWarmerService(PlaceService placeService) {
        this.placeService = placeService;
    }

    /** Sunday 03:00 (server time). Override via app.near-warmer.cron. */
    @Scheduled(cron = "${app.near-warmer.cron:0 0 3 * * SUN}")
    public void warm() {
        int ok = 0;
        for (Loc l : LOCATIONS) {
            for (Cat c : CATEGORIES) {
                try {
                    placeService.search(c.query(), c.category(), l.lat(), l.lng(), 2000);
                    ok++;
                } catch (Exception e) {
                    log.debug("Warm miss ({},{}) {}: {}", l.lat(), l.lng(), c.category(), e.getMessage());
                }
            }
        }
        log.info("Warmed {} /near cache entries", ok);
    }
}
