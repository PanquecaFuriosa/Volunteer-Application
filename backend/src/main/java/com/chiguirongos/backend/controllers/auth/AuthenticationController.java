package com.chiguirongos.backend.controllers.auth;

import javax.naming.AuthenticationException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.dtos.requestsDTO.LoginCredentialsDTO;
import com.chiguirongos.backend.dtos.requestsDTO.RegisterDTO;
import com.chiguirongos.backend.services.AuthorizationService;

import jakarta.validation.Valid;

/**
 * API containing all authorization and authentication endpoints
 */
@RestController
public class AuthenticationController {

    @Autowired
    private AuthorizationService authService;

    /**
     * Logins the user
     * 
     * @param log Login information from the user trying to authenticate
     * @return
     *         If the login is successfull, sends the JWT authorization cookie/
     *         Otherwise returns 401
     */
    @PostMapping("/auth/login")
    public ResponseEntity<String> loginReq(@RequestBody @Valid LoginCredentialsDTO log) {
        try {
            HttpCookie jwtCookie = authService.loginUser(log.getUsername(), log.getPassword());
            return ResponseEntity
                    .ok()
                    .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                    .build();

        } catch (AuthenticationException e) {
            return new ResponseEntity<String>(HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Registers an user
     * 
     * @param reg User data to register
     * @return
     *         If the user is registered, sends a response with a JWT authorization
     *         cookie
     *         If the user already exists, sends a BAD_REQUEST answer.
     */
    @PostMapping("/auth/register")
    public ResponseEntity<String> regisReq(@RequestBody @Valid RegisterDTO reg) {
        reg.setUsername(reg.getUsername().trim());

        authService.registerUser(reg);
        return ResponseEntity.ok().build();
    }

    /**
     * Logouts an user
     * 
     * @param authCookie User JWT authorization cookie
     * @return Response that updates the JWT authorization cookie max age to 0
     */
    @GetMapping("/auth/logout")
    public ResponseEntity<String> logOut(@CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie) {
        HttpCookie expiredCookie = ResponseCookie.from(SecurityConstants.AUTH_COOKIE_NAME, null)
                .httpOnly(false)
                .maxAge(0l)
                .path("/")
                .sameSite("Lax")
                .secure(false)
                .build();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, expiredCookie.toString())
                .build();
    }
}
