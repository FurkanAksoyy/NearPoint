package com.furkanaksoyy.nearpoint.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "poll_votes", uniqueConstraints = @UniqueConstraint(name = "uq_poll_voter", columnNames = {"slug", "voter"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PollVote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 16)
    private String slug;

    private String placeId;

    @Column(length = 64)
    private String voter;

    private LocalDateTime createdAt;
}
