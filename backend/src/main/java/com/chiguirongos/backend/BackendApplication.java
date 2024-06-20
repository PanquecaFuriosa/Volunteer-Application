package com.chiguirongos.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan({ "com.chiguirongos.backend.configuration.security", "com.chiguirongos.backend.controllers.*",
		"com.chiguirongos.backend.services", "com.chiguirongos.backend.exceptions",
		"com.chiguirongos.backend.scheduled", "com.chiguirongos.backend.configuration.reports",
		"com.chiguirongos.backend.configuration.data" })
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}
}
