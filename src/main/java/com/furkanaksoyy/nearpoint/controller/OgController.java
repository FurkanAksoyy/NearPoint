package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.dto.PollResponse;
import com.furkanaksoyy.nearpoint.dto.SharedListResponse;
import com.furkanaksoyy.nearpoint.service.PollService;
import com.furkanaksoyy.nearpoint.service.ShareService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

/**
 * Server-rendered Open Graph pages for shared links. Social unfurlers (WhatsApp, Telegram,
 * Twitter, Slack…) don't run JS, so the React SPA's client-side meta never reaches them.
 * The reverse proxy routes unfurler user-agents on /poll/* and /s/* here; humans still get the SPA.
 */
@RestController
@Tag(name = "OpenGraph", description = "Server-rendered link previews for shared polls & lists")
public class OgController {

    private final PollService pollService;
    private final ShareService shareService;

    public OgController(PollService pollService, ShareService shareService) {
        this.pollService = pollService;
        this.shareService = shareService;
    }

    @GetMapping(value = "/og/poll/{slug}", produces = MediaType.TEXT_HTML_VALUE)
    public String pollOg(@PathVariable String slug, HttpServletRequest request) {
        String base = baseUrl(request);
        String canonical = base + "/poll/" + slug;
        try {
            PollResponse poll = pollService.get(slug);
            String title = blankTo(poll.name(), "Where should we go?");
            int n = poll.places() == null ? 0 : poll.places().size();
            String desc = n + " options · vote free, no login needed · NearPoint";
            return page(title, desc, canonical, base);
        } catch (Exception e) {
            return page("NearPoint", "Discover great places near you.", canonical, base);
        }
    }

    @GetMapping(value = "/og/s/{slug}", produces = MediaType.TEXT_HTML_VALUE)
    public String listOg(@PathVariable String slug, HttpServletRequest request) {
        String base = baseUrl(request);
        String canonical = base + "/s/" + slug;
        try {
            SharedListResponse list = shareService.get(slug);
            boolean trip = "trip".equals(list.kind());
            String title = blankTo(list.name(), trip ? "A trip on NearPoint" : "A list on NearPoint");
            int n = list.places() == null ? 0 : list.places().size();
            String desc = n + (trip ? " stops" : " places") + " · a NearPoint " + (trip ? "trip" : "list");
            return page(title, desc, canonical, base);
        } catch (Exception e) {
            return page("NearPoint", "Discover great places near you.", canonical, base);
        }
    }

    private String page(String title, String desc, String url, String base) {
        String t = esc(title);
        String d = esc(desc);
        String u = esc(url);
        String img = base + "/og-image.png";
        return "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">"
                + "<title>" + t + " — NearPoint</title>"
                + "<meta property=\"og:type\" content=\"website\">"
                + "<meta property=\"og:site_name\" content=\"NearPoint\">"
                + "<meta property=\"og:title\" content=\"" + t + "\">"
                + "<meta property=\"og:description\" content=\"" + d + "\">"
                + "<meta property=\"og:url\" content=\"" + u + "\">"
                + "<meta property=\"og:image\" content=\"" + esc(img) + "\">"
                + "<meta name=\"twitter:card\" content=\"summary_large_image\">"
                + "<meta name=\"twitter:title\" content=\"" + t + "\">"
                + "<meta name=\"twitter:description\" content=\"" + d + "\">"
                + "<meta name=\"twitter:image\" content=\"" + esc(img) + "\">"
                + "<link rel=\"canonical\" href=\"" + u + "\">"
                + "<meta http-equiv=\"refresh\" content=\"0; url=" + u + "\">"
                + "</head><body>Opening <a href=\"" + u + "\">NearPoint</a>…</body></html>";
    }

    private String baseUrl(HttpServletRequest request) {
        String proto = blankTo(request.getHeader("X-Forwarded-Proto"), request.getScheme());
        String host = blankTo(request.getHeader("X-Forwarded-Host"), request.getHeader("Host"));
        return proto + "://" + host;
    }

    private static String blankTo(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
