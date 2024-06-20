package com.chiguirongos.backend.controllers.api.volunteer;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;
import com.chiguirongos.backend.dtos.requestsDTO.EditPreferencesDTO;
import com.chiguirongos.backend.dtos.responsesDTO.UserDTO;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.services.AuthorizationService;
import com.chiguirongos.backend.services.volunteer.VolunteerDetailsService;

import jakarta.validation.Valid;

/**
 * Controller that contains all the endpoints to functionalities related to
 * the management or retrieval of a volunteer's profile.
 */
@RestController
public class VolunteerDetailsController {

    @Autowired
    private VolunteerDetailsService userDetailsService;
    @Autowired
    private AuthorizationService authService;

    /**
     * Endpoint to edit user's preferences
     * 
     * @param authCookie JWT authorization cookie of the user
     * @param preference A DTO with all user's new preferences
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/api/user/user-edit")
    public ResponseEntity<String> userUpdate(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestBody @Valid EditPreferencesDTO preference) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        userDetailsService.editUserPreferences(volunteer, preference);
        return ResponseEntity.ok("Correctly edited");
    }

    /**
     * Endpoint to get all user's details
     * 
     * @param authCookie JWT authorization cookie of the user
     * @return A ResponseEntity containing a DTO with all user's details
     */
    @GetMapping("/api/user/details")
    public ResponseEntity<UserDTO> userDetails(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        UserDTO details = userDetailsService.getDetails(volunteer);
        return ResponseEntity.ok(details);
    }


    /**
     * Endpoint to get all user's preferences
     * 
     * @param authCookie JWT authorization cookie of the user
     * @return A ResponseEntity containing a DTO with all user's preferences
     */
    @GetMapping("/api/user/preferences")
    public ResponseEntity<UserDTO> userPreferences(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        UserDTO details = userDetailsService.getPreferences(volunteer);
        return ResponseEntity.ok(details);
    }
}
