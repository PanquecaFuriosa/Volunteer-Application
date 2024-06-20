package com.chiguirongos.backend.configuration.security.Admin;

import java.time.LocalDate;
import java.util.Base64;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.chiguirongos.backend.configuration.security.SecurityConfig;
import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.repositories.UserRepository;

import jakarta.annotation.PostConstruct;

/**
 * Bean created only to initialize admin credentials data.
 */
@Component
public class AdminCreator {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private SecurityConfig secConf;

    /**
     * Initializes the admin credentials.
     */
    @PostConstruct
    public void init() {
        if (userRepository.existsByUserName(SecurityConstants.ADMIN_USERNAME))
            return;

        userRepository.save(new UserEntity(SecurityConstants.ADMIN_USERNAME, "admin",
                LocalDate.of(1998, 2, 18),
                secConf.passwordEncoder().encode(Base64.getEncoder().encodeToString("admin".getBytes())),
                "", ModelsConstants.ADMIN_ROLE));
    }
}
