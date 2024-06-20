package com.chiguirongos.backend.controllers.api.volunteer;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;
import com.chiguirongos.backend.dtos.responsesDTO.UserHourBlockDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkSessionDTO;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.services.AuthorizationService;
import com.chiguirongos.backend.services.volunteer.VolunteerWorkService;

import jakarta.validation.Valid;

/**
 * Controller that contains all the endpoints to functionalities related to
 * the works from a volunteer's point of view
 */
@RestController
public class VolunteerWorkController {

    @Autowired
    private VolunteerWorkService volWorkService;
    @Autowired
    private AuthorizationService authService;

    /**
     * Endpoint for retrieving all available works in a certain month and year
     * that have hour blocks matching a list of user preferred blocks.
     *
     * @param authCookie JWT authorization cookie of the user
     * @param prefBlocks Volunteer preferred work blocks
     * @param month      Month to get matching works from
     * @param year       Year to get matching works from
     * @return A ResponseEntity containing a list of works
     */
    @PostMapping("/api/user/works-by")
    public ResponseEntity<List<WorkDTO>> getWorksMatchingHourBlocks(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestBody @Valid List<UserHourBlockDTO> prefBlocks,
            @RequestParam Integer month,
            @RequestParam Integer year) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);

        List<WorkDTO> works = volWorkService.getVolunteerPreferredWorks(volunteer, prefBlocks,
                month,
                year);
        return ResponseEntity.ok(works);
    }

    /**
     * Gets the work sessions status of a volunteer in a specific month and year.
     * 
     * @param authCookie JWT authorization cookie of the user
     * @param month      Month to get sessions from
     * @param year       Year to get sessions from
     * @return List containing all the work sessions statuses of the volunteer in
     *         the month and year specified
     */
    @GetMapping("/api/user/work-sessions")
    public ResponseEntity<List<WorkSessionDTO>> getVolunteerWorkSessions(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Integer month,
            @RequestParam Integer year) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        return ResponseEntity.ok(volWorkService.getVolunteerWorkSessions(volunteer, month, year));
    }

    /**
     * Retrieves the work associated to a work session
     * 
     * @param authCookie JWT authorization cookie of the user
     * @param sessionId  Id of the session to retrieve its work from
     * @return DTO containing all the information of the work retrieved from the
     *         session
     */
    @GetMapping("/api/user/work-from-session")
    public ResponseEntity<WorkDTO> getWorkFromSession(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Long sessionId) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        return ResponseEntity.ok(volWorkService.getWorkFromSession(volunteer, sessionId));
    }
}
