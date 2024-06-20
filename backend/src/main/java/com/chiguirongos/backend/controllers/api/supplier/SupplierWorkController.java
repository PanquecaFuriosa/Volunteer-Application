package com.chiguirongos.backend.controllers.api.supplier;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;
import com.chiguirongos.backend.dtos.requestsDTO.CreateWorkDTO;
import com.chiguirongos.backend.dtos.requestsDTO.DeleteWorkDTO;
import com.chiguirongos.backend.dtos.requestsDTO.EditWorkDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkDTO;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.services.AuthorizationService;
import com.chiguirongos.backend.services.supplier.SupplierWorkService;

import jakarta.validation.Valid;

/**
 * Controller class for managing works.
 */
@RestController
public class SupplierWorkController {

    @Autowired
    private SupplierWorkService supplierWorkService;
    @Autowired
    private AuthorizationService authService;

    /**
     * Endpoint for creating a new work.
     *
     * @param authCookie Jwt authorization cookie of the user
     * @param work       The DTO object representing the work to be registered
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/api/supplier/work-create")
    public ResponseEntity<String> workRegister(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestBody @Valid CreateWorkDTO work) {

        String supplierUserName = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(supplierUserName);
        supplierWorkService.createSupplierWork(supplier, work);
        return ResponseEntity.ok("Work correctly created.");
    }

    /**
     * Endpoint for updating an existing work.
     *
     * @param authCookie Jwt authorization cookie of the user
     * @param work       The DTO object representing the updated work
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/api/supplier/work-edit")
    public ResponseEntity<String> workUpdate(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestBody @Valid EditWorkDTO work) {

        String supplierUserName = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(supplierUserName);
        supplierWorkService.editSupplierWork(supplier, work);
        return ResponseEntity.ok("Correctly edited");
    }

    /**
     * Endpoint to retrieve all supplier works in certain month and year
     * 
     * @param authCookie Jwt authorization cookie of the user
     * @param month      Month to retrieve works from
     * @param year       Year to retrieve works from
     * @return A list of works where the month and year are between the start date
     *         and end date of the work
     */
    @GetMapping("/api/supplier/works")
    public ResponseEntity<List<WorkDTO>> getSupplierWorksForMonth(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestParam Integer month, @RequestParam Integer year) {

        String supplierUserName = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(supplierUserName);
        List<WorkDTO> works = supplierWorkService.getSupplierWorksInMonthYear(supplier, month,
                year);
        return ResponseEntity.ok(works);
    }

    /**
     * Endpoint for deleting works.
     * 
     * @param authCookie Jwt authorization cookie of the user
     * @param delReq     DTO with the requested work to delete
     * @return A ResponseEntity with an OK status if everything went
     *         correctly/BAD_REQUEST otherwise.
     */
    @DeleteMapping("/api/supplier/del-work")
    public ResponseEntity<String> deleteSupplierWork(
            @CookieValue(name = SecurityConstants.AUTH_COOKIE_NAME) String authCookie,
            @RequestBody @Valid DeleteWorkDTO delReq) {

        String supplierUserName = JWTSecurityUtils.getAuthUserFromJWT(authCookie);
        UserEntity supplier = authService.retrieveUser(supplierUserName);
        supplierWorkService.deleteSupplierWork(supplier, delReq);
        return ResponseEntity.ok("Deleted");
    }
}
