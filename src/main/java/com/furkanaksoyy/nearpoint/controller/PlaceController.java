package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.model.Place;
import com.furkanaksoyy.nearpoint.model.PlaceSearchRequest;
import com.furkanaksoyy.nearpoint.service.PlaceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/places")
public class PlaceController {

    private final PlaceService placeService;

    @Autowired
    public PlaceController(PlaceService placeService) {
        this.placeService = placeService;
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<Place>> getNearbyPlaces(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam Integer radius) {

        List<Place> places = placeService.getNearbyPlaces(latitude, longitude, radius);
        return ResponseEntity.ok(places);
    }
}