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
import com.chiguirongos.backend.dtos.requestsDTO.EditPostulationDTO;
import com.chiguirongos.backend.dtos.requestsDTO.CreatePostulationDTO;
import com.chiguirongos.backend.dtos.responsesDTO.PostulationDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkDTO;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.services.AuthorizationService;
import com.chiguirongos.backend.services.volunteer.VolunteerPostulationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Controller containing all the routes related to
 * volunteers and their postulations operations
 */
@RestController
public class VolunteerPostulationsController {

    @Autowired
    private VolunteerPostulationService userPostulationService;
    @Autowired
    private AuthorizationService authService;

    /**
     * Gets all the postulations of a volunteer
     * 
     * @param authCookie jwt authorization cookie of the user
     * @return A list with all user's postulations
     */
    @GetMapping("/api/user/postulations")
    public ResponseEntity<List<PostulationDTO>> getVolunteerPostulations(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        List<PostulationDTO> response = userPostulationService.getVolunteerPostulations(volunteer);
        return ResponseEntity.ok(response);
    }

    /**
     * Gets all the postulations of a volunteer using pagination
     */
    @GetMapping("/api/user/page-postulations")
    public ResponseEntity<List<PostulationDTO>> getPagedVolunteerPostulations(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @PositiveOrZero @RequestParam Integer page, @Positive @RequestParam Integer pageSize) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        List<PostulationDTO> response = userPostulationService.getPagedVolunteerPostulations(volunteer,
                page,
                pageSize);
                
        return ResponseEntity.ok(response);
    }

    /**
     * Tries to create a new volunteer postulation
     * 
     * @param authCookie       Jwt authorization cookie of the user
     * @param postulateDetails All details of new postulation
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/api/user/postulate")
    public ResponseEntity<String> postulateUser(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestBody @Valid CreatePostulationDTO postulateDetails) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        userPostulationService.postulateUser(volunteer, postulateDetails);
        return ResponseEntity.ok("postulation successfully created");
    }

    /**
     * Cancels a volunteer postulation
     * 
     * @param authCookie       Jwt authorization cookie of the user
     * @param postulateDetails ID of the postulation to cancel
     * @return A ResponseEntity indicating the result of the operation
     */
    @GetMapping("/api/user/cancel-postulation")
    public ResponseEntity<String> cancelPostulation(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Long postulationId) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        userPostulationService.cancelPostulation(volunteer, postulationId);
        return ResponseEntity.ok("Postulation successfully removed");
    }

    /**
     * Edits a volunteer postulation
     * 
     * @param authCookie Jwt authorization cookie of the user
     * @param editData   DTO containing data to edit
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/api/user/edit-postulation")
    public ResponseEntity<String> editPostulation(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestBody @Valid EditPostulationDTO editData) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        userPostulationService.editPostulation(volunteer, editData);
        return ResponseEntity.ok("Postulation successfully edited");
    }

    /**
     * Retrieves the work related to a postulation
     * 
     * @param authCookie    Jwt authorization cookie of the user
     * @param postulationId Postulation ID
     * @return Work DTO containing all the information related to the postulation
     *         work
     */
    @GetMapping("/api/user/postulation-work")
    public ResponseEntity<WorkDTO> getPostulationWork(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Long postulationId) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        return ResponseEntity.ok(userPostulationService.getPostulationWork(volunteer, postulationId));
    }

    /**
     * Retrieves the postulation made by a specific volunteer, from a work.
     * 
     * @param authCookie Jwt authorization cookie of the user
     * @param workId     Id of the work to retrieve the volunteer postulation
     * @return Postulation information
     */
    @GetMapping("/api/user/work-postulation")
    public ResponseEntity<PostulationDTO> getWorkUserPostulation(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Long workId) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity volunteer = authService.retrieveUser(username);
        return ResponseEntity.ok(userPostulationService.getWorkUserPostulation(volunteer, workId));
    }
}
