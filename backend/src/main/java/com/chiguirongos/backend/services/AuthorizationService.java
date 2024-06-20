package com.chiguirongos.backend.services;

import javax.naming.AuthenticationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;
import com.chiguirongos.backend.dtos.requestsDTO.RegisterDTO;
import com.chiguirongos.backend.exceptions.runtime.NonExistentUserException;
import com.chiguirongos.backend.exceptions.runtime.UsernameTakenException;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.repositories.UserRepository;

/**
 * Service containing logic and functionalities to authorize
 * users in the system.
 */
@Service
public class AuthorizationService {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository users;
    @Autowired
    private PasswordEncoder encoder;

    public UserEntity retrieveUser(String username) throws NonExistentUserException {
        UserEntity user = users.findByUserName(username);
        if (user == null)
            throw new NonExistentUserException();

        return user;
    }

    /**
     * Registers an user
     * 
     * @param reg User data to register
     */
    public UserEntity registerUser(RegisterDTO reg) {
        if (reg.getUsername().equals(SecurityConstants.ADMIN_USERNAME))
            throw new UsernameTakenException();

        if (users.existsByUserName(reg.getUsername().trim()))
            throw new UsernameTakenException();

        UserEntity newUser = new UserEntity(
                reg.getUsername().trim(),
                reg.getName(),
                reg.getBirthDate(),
                encoder.encode(reg.getPassword().trim()),
                reg.getInstitutionalID(),
                reg.getRole());

        return users.save(newUser);
    }

    /**
     * Logins an user in the system and generates the JWT auth cookie
     * 
     * @param username Username of the user
     * @param password Password of the user
     * @return JWT Authentication cookie
     * @throws AuthenticationException In case the credentials are not valid
     */
    public HttpCookie loginUser(String username, String password) throws AuthenticationException {
        if (username.trim().equals(SecurityConstants.ADMIN_USERNAME))
            throw new AuthenticationException("Wrong credentials");

        UserEntity appUser = retrieveUser(username.trim());
        SecurityContext sContext = SecurityContextHolder.createEmptyContext();
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(appUser.getUserName(), password));

        sContext.setAuthentication(auth);
        return JWTSecurityUtils.createJWTUserAuthCookie(SecurityConstants.AUTH_COOKIE_NAME,
                JWTSecurityUtils.generateJWTUserAuthToken(auth));
    }
}
