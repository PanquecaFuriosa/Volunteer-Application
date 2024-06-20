package com.chiguirongos.backend.controllers.api.supplier;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;
import com.chiguirongos.backend.dtos.responsesDTO.PostulationDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkDTO;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.services.AuthorizationService;
import com.chiguirongos.backend.services.supplier.SupplierPostulationService;

/**
 * Controller that handles all of the suppliers' postulations
 * operations
 */
@RestController
public class SupplierPostulationController {

    @Autowired
    private SupplierPostulationService supplierPostulationService;
    @Autowired
    private AuthorizationService authService;

    /**
     * Rejects a volunteer postulation
     * 
     * @param authCookie    JWT auth of the rejecting supplier
     * @param postulationId ID of the postulation to reject
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/api/supplier/reject-postulation")
    public ResponseEntity<String> rejectPostulation(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Long postulationId) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(username);
        supplierPostulationService.rejectUserPostulation(supplier, postulationId);

        return ResponseEntity.ok("Postulation rejected");
    }

    /**
     * Accept a volunteer postulation
     * 
     * @param authCookie    JWT auth of the accepting supplier
     * @param postulationId ID of the postulation to accept
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/api/supplier/accept-postulation")
    public ResponseEntity<String> acceptPostulation(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Long postulationId) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(username);
        supplierPostulationService.acceptUserPostulation(supplier, postulationId);

        return ResponseEntity.ok("Postulation Accepted");
    }

    /**
     * Retrieves all the pending postulations from a work.
     * 
     * @param authCookie JWT auth of the supplier
     * @param workId     Work id of the work to get pending postulations from
     * @return List of all the pending postulations from a work
     */
    @GetMapping("/api/supplier/work-pending-postulations")
    public ResponseEntity<List<PostulationDTO>> getWorkPendingPostulations(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Long workId) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(username);
        return ResponseEntity.ok(supplierPostulationService.getWorkPendingPostulations(supplier, workId));
    }

    /**
     * Gets all the pending postulations for works of a supplier.
     * 
     * @param authCookie JWT auth of the supplier
     * @param page       Postulation page
     * @param pageSize   Postulation page size
     * @return Postulations for the supplier works, with pending status
     */
    @GetMapping("/api/supplier/pending-postulations-works")
    public ResponseEntity<List<WorkDTO>> getPendingPostulations(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Integer page, @RequestParam Integer pageSize) {

        String username = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(username);
        return ResponseEntity
                .ok(supplierPostulationService.getPaginatedWorksWithPendingPostulations(supplier, page, pageSize));
    }
}
