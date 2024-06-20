package com.chiguirongos.backend.controllers.api.supplier;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;
import com.chiguirongos.backend.dtos.requestsDTO.WorkBlockDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkSessionDTO;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.WorkSessionStatusEnum;
import com.chiguirongos.backend.services.AuthorizationService;
import com.chiguirongos.backend.services.supplier.SupplierWorkSessionService;

import jakarta.validation.Valid;

/**
 * Controller that contains all the functionalities to manage work session 
 * from a supplier point of view
 */
@RestController
public class SupplierWorkSessionController {

    @Autowired
    private SupplierWorkSessionService workSessionService;
    @Autowired
    private AuthorizationService authService;

    /**
     * Changes a work's session status
     * 
     * @param authCookie JWT auth of the supplier
     * @param sessionId  ID of the session to change its status
     * @param newStatus  New status of the session
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/api/supplier/session-status")
    public ResponseEntity<String> changeSessionStatus(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Long sessionId, @RequestParam WorkSessionStatusEnum newStatus) {

        String supplierUserName = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(supplierUserName);
        workSessionService.changeSessionStatus(supplier, sessionId, newStatus);

        return ResponseEntity.ok("Status changed");
    }

    /**
     * Gets the work sessions from a supplier work in a date and hour block.
     * 
     * @param authCookie JWT auth of the supplier
     * @param request    DTO containing work id, hour block and date to retrieve
     *                   sessions from
     * @return List of work sessions DTOs containing its id, status, volunteer
     *         username, volunteer fullname
     */
    @PostMapping("/api/supplier/work-sessions")
    public ResponseEntity<List<WorkSessionDTO>> getWorkSessions(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestBody @Valid WorkBlockDTO request) {

        String supplierUserName = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(supplierUserName);
        return ResponseEntity.ok(workSessionService.getWorkSessionsByBlock(supplier, request));
    }
}