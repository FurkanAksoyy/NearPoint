package com.furkanaksoyy.nearpoint.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.furkanaksoyy.nearpoint.dto.SharePlace;
import com.furkanaksoyy.nearpoint.dto.ShareRequest;
import com.furkanaksoyy.nearpoint.dto.SharedListResponse;
import com.furkanaksoyy.nearpoint.model.SharedList;
import com.furkanaksoyy.nearpoint.repository.SharedListRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ShareService {

    private static final String ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RNG = new SecureRandom();

    private final SharedListRepository repository;
    private final ObjectMapper mapper;

    public ShareService(SharedListRepository repository, ObjectMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional
    public String create(ShareRequest request, Long userId) {
        SharedList entity = new SharedList();
        entity.setSlug(uniqueSlug());
        entity.setName(request.name());
        entity.setKind(request.kind());
        try {
            entity.setPayload(mapper.writeValueAsString(request.places()));
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid list");
        }
        entity.setUserId(userId);
        entity.setCreatedAt(LocalDateTime.now());
        repository.save(entity);
        return entity.getSlug();
    }

    public SharedListResponse get(String slug) {
        SharedList entity = repository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        List<SharePlace> places;
        try {
            places = mapper.readValue(entity.getPayload(), new TypeReference<List<SharePlace>>() { });
        } catch (Exception e) {
            places = List.of();
        }
        return new SharedListResponse(entity.getSlug(), entity.getName(), entity.getKind(), places, entity.getCreatedAt());
    }

    private String uniqueSlug() {
        for (int i = 0; i < 5; i++) {
            String s = randomSlug(8);
            if (!repository.existsBySlug(s)) return s;
        }
        return randomSlug(12);
    }

    private String randomSlug(int len) {
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(ALPHABET.charAt(RNG.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }
}
