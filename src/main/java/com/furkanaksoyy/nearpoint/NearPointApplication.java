package com.furkanaksoyy.nearpoint;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class NearPointApplication {

    public static void main(String[] args) {
        SpringApplication.run(NearPointApplication.class, args);
    }

}
