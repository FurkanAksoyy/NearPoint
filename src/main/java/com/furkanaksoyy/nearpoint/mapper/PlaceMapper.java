package com.furkanaksoyy.nearpoint.mapper;

import com.furkanaksoyy.nearpoint.dto.PlaceResponse;
import com.furkanaksoyy.nearpoint.model.Place;
import org.mapstruct.Mapper;

import java.util.List;

/**
 * Maps JPA entities to API DTOs. Field names line up 1:1, so MapStruct generates
 * the implementation at compile time (componentModel=spring via compiler arg).
 */
@Mapper(componentModel = "spring")
public interface PlaceMapper {

    PlaceResponse toResponse(Place place);

    List<PlaceResponse> toResponseList(List<Place> places);
}
