package com.furkanaksoyy.nearpoint.service;

import com.furkanaksoyy.nearpoint.dto.FavoriteDto;
import com.furkanaksoyy.nearpoint.model.UserFavorite;
import com.furkanaksoyy.nearpoint.repository.UserFavoriteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FavoriteService {

    private final UserFavoriteRepository repository;

    public FavoriteService(UserFavoriteRepository repository) {
        this.repository = repository;
    }

    public List<FavoriteDto> list(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toDto).toList();
    }

    @Transactional
    public void add(Long userId, FavoriteDto dto) {
        if (repository.existsByUserIdAndPlaceId(userId, dto.placeId())) {
            return; // idempotent
        }
        UserFavorite f = new UserFavorite();
        f.setUserId(userId);
        f.setPlaceId(dto.placeId());
        f.setName(dto.name());
        f.setVicinity(dto.vicinity());
        f.setLatitude(dto.latitude());
        f.setLongitude(dto.longitude());
        f.setTypes(dto.types());
        f.setRating(dto.rating());
        f.setUserRatingsTotal(dto.userRatingsTotal());
        f.setPhotoReference(dto.photoReference());
        f.setPriceLevel(dto.priceLevel());
        f.setOpenNow(dto.openNow());
        f.setCreatedAt(LocalDateTime.now());
        repository.save(f);
    }

    @Transactional
    public void remove(Long userId, String placeId) {
        repository.deleteByUserIdAndPlaceId(userId, placeId);
    }

    private FavoriteDto toDto(UserFavorite f) {
        return new FavoriteDto(f.getPlaceId(), f.getName(), f.getVicinity(), f.getLatitude(), f.getLongitude(),
                f.getTypes(), f.getRating(), f.getUserRatingsTotal(), f.getPhotoReference(), f.getPriceLevel(), f.getOpenNow());
    }
}
