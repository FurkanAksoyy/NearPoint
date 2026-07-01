package com.furkanaksoyy.nearpoint.controller;

import com.furkanaksoyy.nearpoint.AbstractPostgresIT;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end auth flow against a real PostgreSQL: register → protect → favorites → login.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIT extends AbstractPostgresIT {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerProtectFavoritesLoginFlow() throws Exception {
        String reg = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"it@nearpoint.app\",\"password\":\"secret12345\",\"displayName\":\"IT\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(reg, "$.token");

        // Protected endpoint rejects anonymous requests
        mockMvc.perform(get("/api/me/favorites")).andExpect(status().isForbidden());

        // Add + list a favorite with the token
        mockMvc.perform(post("/api/me/favorites")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"placeId\":\"p1\",\"name\":\"Test Place\",\"rating\":4.7}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/me/favorites").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].placeId").value("p1"))
                .andExpect(jsonPath("$[0].name").value("Test Place"));

        // Duplicate email is rejected
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"it@nearpoint.app\",\"password\":\"secret12345\"}"))
                .andExpect(status().isConflict());

        // Login works and returns a token
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"it@nearpoint.app\",\"password\":\"secret12345\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());

        // Wrong password is rejected
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"it@nearpoint.app\",\"password\":\"wrongpassword\"}"))
                .andExpect(status().isUnauthorized());
    }
}
