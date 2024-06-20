package com.chiguirongos.backend.configuration.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.repositories.UserRepository;

/**
 * UserDetailsService implementation using JPA
 */
@Component
public class JPAUsersDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserEntity appUser = userRepo.findByUserName(username);
        if (appUser == null)
            throw new UsernameNotFoundException("Non existent user: " + username);

        UserDetails user = User.builder()
            .username(username)
            .password(appUser.getPassword())
            .accountLocked(appUser.getSuspended())
            .authorities(appUser.getRole()).build();
            
        return user;
    }
    
}
