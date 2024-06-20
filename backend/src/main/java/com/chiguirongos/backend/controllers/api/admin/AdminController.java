package com.chiguirongos.backend.controllers.api.admin;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;

import javax.naming.AuthenticationException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;
import com.chiguirongos.backend.dtos.requestsDTO.EditUserDetailsDTO;
import com.chiguirongos.backend.dtos.requestsDTO.RestartPasswordDTO;
import com.chiguirongos.backend.dtos.requestsDTO.LoginCredentialsDTO;
import com.chiguirongos.backend.dtos.responsesDTO.UserDTO;
import com.chiguirongos.backend.exceptions.runtime.NonExistentUserException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedRoleException;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.repositories.UserRepository;
import com.chiguirongos.backend.services.AdminService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Controller that contains all the endpoints to the admin functionalities
 */
@RestController
public class AdminController {

    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private AdminService adminService;
    private Logger logger = LogManager.getLogger();

    /**
     * Endpoint to get all users in system in a paginated manner
     * 
     * @param adminCookie ADM cookie for admins
     * @param page Page of users
     * @param pageSize Page size
     * @return A ResponseEntity containing a list of users
     */
    @GetMapping("/admin/users")
    public ResponseEntity<List<UserDTO>> getUsers(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie,
            @PositiveOrZero @RequestParam Integer page, @Positive @RequestParam Integer pageSize) {
        try {
            List<UserDTO> users = adminService.getUsersByPage(page, pageSize);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error(e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Endpoint to get all suppliers in system in a paginate manner
     * 
     * @param adminCookie ADM cookie for admins
     * @param page Page of users
     * @param pageSize Page size
     * @return A ResponseEntity containing a list of suppliers
     */
    @GetMapping("/admin/suppliers")
    public ResponseEntity<List<UserDTO>> getSuppliers(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie,
            @PositiveOrZero @RequestParam Integer page, @Positive @RequestParam Integer pageSize) {
        try {
            List<UserDTO> users = adminService.getProvidersByPage(page, pageSize);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error(e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Endpoint to edit details of an user
     * 
     * @param adminCookie ADM cookie for admins
     * @param details     A DTO with all new user's detail
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/admin/edit-user")
    public ResponseEntity<String> editUser(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie,
            @RequestBody @Valid EditUserDetailsDTO details) {

        adminService.editUser(details);
        return ResponseEntity.ok("User uccessfully edited");
    }

    /**
     * Endpoint to change suspended status of an user
     * 
     * @param adminCookie ADM cookie for admins
     * @param username    User's username who admin wants to change its suspend
     *                    status
     * @return A ResponseEntity indicating the result of the operation
     */
    @GetMapping("/admin/change-suspended-status")
    public ResponseEntity<String> changeSuspendedStatus(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie,
            @RequestParam String encodedUsername) {

        // decode username
        byte[] decodedBytes = Base64.getDecoder().decode(encodedUsername);
        String username = new String(decodedBytes, StandardCharsets.UTF_8);

        adminService.changeSuspendedStatus(username);
        return ResponseEntity.ok("User successfully suspended");
    }

    /**
     * Endpoint to delete an user
     * 
     * @param adminCookie     ADM cookie for admins
     * @param encodedUsername Encode in Base64 User's username who admin wants to
     *                        delete of system
     * @return A ResponseEntity indicating the result of the operation
     */
    @GetMapping("/admin/delete-user")
    public ResponseEntity<String> deleteUser(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie,
            @RequestParam String encodedUsername) {

        // decode username
        byte[] decodedBytes = Base64.getDecoder().decode(encodedUsername);
        String username = new String(decodedBytes, StandardCharsets.UTF_8);

        adminService.deleteUser(username);
        return ResponseEntity.ok("User successfully deleted");
    }

    /**
     * Endpoint to set a new password to an user
     * 
     * @param adminCookie ADM cookie for admins
     * @param details     A DTO with the user to change its password and the new
     *                    password
     * @return A ResponseEntity indicating the result of the operation
     */
    @PostMapping("/admin/reset-password")
    public ResponseEntity<String> resetPassword(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie,
            @RequestBody @Valid RestartPasswordDTO details) {

        adminService.resetPassword(details);
        return ResponseEntity.ok("User's password successfully reseted");
    }

    /**
     * Admin login endpoint. Sets the admin special cookie ADM for further
     * authorization/authentication.
     * 
     * @param log Credentials (userName and password)
     * @return OK and a cookie ADM used for auth within the admin endpoints.
     */
    @PostMapping("/auth/admin-login")
    public ResponseEntity<String> adminLoginReq(@RequestBody @Valid LoginCredentialsDTO log) {
        try {
            if (!log.getUsername().equals(SecurityConstants.ADMIN_USERNAME))
                throw new AuthenticationException("Wrong credentials.");

            UserEntity appUser = userRepository.findByUserName(log.getUsername());
            if (appUser == null)
                throw new NonExistentUserException();

            if (!appUser.getRole().equals(ModelsConstants.ADMIN_ROLE))
                throw new UnauthorizedRoleException();

            SecurityContext sContext = SecurityContextHolder.createEmptyContext();
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(appUser.getUserName(), log.getPassword()));

            sContext.setAuthentication(auth);
            HttpCookie adminCookie = JWTSecurityUtils.createJWTAdminCookie();

            return ResponseEntity
                    .ok()
                    .header(HttpHeaders.SET_COOKIE, adminCookie.toString())
                    .build();

        } catch (AuthenticationException e) {
            return new ResponseEntity<String>(HttpStatus.UNAUTHORIZED);
        }
    }

    /**
     * Logouts and admin. Deletes its ADM cookie.
     * 
     * @param adminCookie ADM cookie for admins
     * @return OK if the admin is correctly loged out
     */
    @GetMapping("/admin/logout")
    public ResponseEntity<String> adminLogoutReq(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie) {

        HttpCookie expiredCookie = ResponseCookie.from(SecurityConstants.ADMIN_COOKIE_NAME, null)
                .httpOnly(true)
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

    /**
     * Health check of the admin cookie.
     * 
     * @param adminCookie ADM cookie for admins
     * @return OK if the admin is authenticated and the cookie is valid.
     */
    @GetMapping("/admin/health")
    public ResponseEntity<String> healtCheckReq(
            @CookieValue(name = SecurityConstants.ADMIN_COOKIE_NAME) String adminCookie) {

        return ResponseEntity
                .ok()
                .build();
    }
}
