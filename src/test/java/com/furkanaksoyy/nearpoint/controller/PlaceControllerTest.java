package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.config.SecurityConfig;
import com.furkanaksoyy.nearpoint.config.WebConfig;
import com.furkanaksoyy.nearpoint.service.PlaceService;
import com.furkanaksoyy.nearpoint.service.TurnstileService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer slice test: validation, Turnstile gate, and the happy path.
 */
@WebMvcTest(PlaceController.class)
@Import({SecurityConfig.class, WebConfig.class})
class PlaceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private PlaceService placeService;
    @MockitoBean
    private TurnstileService turnstileService;

    @Test
    void validRequestReturnsOk() throws Exception {
        when(turnstileService.verify(any(), any())).thenReturn(true);
        when(placeService.search(any(), any(), any(), any(), any(), any())).thenReturn(List.of());

        mockMvc.perform(get("/api/places/nearby")
                        .param("latitude", "41.0")
                        .param("longitude", "29.0")
                        .param("radius", "1000")
                        .param("query", "hamburger"))
                .andExpect(status().isOk());
    }

    @Test
    void invalidLatitudeReturns400WithFieldError() throws Exception {
        when(turnstileService.verify(any(), any())).thenReturn(true);

        mockMvc.perform(get("/api/places/nearby")
                        .param("latitude", "999")
                        .param("longitude", "29.0")
                        .param("radius", "1000"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.latitude").exists());
    }

    @Test
    void turnstileFailureReturns403() throws Exception {
        when(turnstileService.verify(any(), any())).thenReturn(false);

        mockMvc.perform(get("/api/places/nearby")
                        .param("latitude", "41.0")
                        .param("longitude", "29.0")
                        .param("radius", "1000"))
                .andExpect(status().isForbidden());
    }
}
