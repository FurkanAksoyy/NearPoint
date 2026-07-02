package com.furkanaksoyy.nearpoint.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "shared_lists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SharedList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 16)
    private String slug;

    private String name;
    private String kind;

    @Column(columnDefinition = "text")
    private String payload;

    private Long userId;

    /** True for app-generated "poll of the week" entries surfaced on the home page. */
    @Column(nullable = false)
    private boolean featured = false;

    private LocalDateTime createdAt;
}
