package com.chiguirongos.backend.configuration.security.Admin;

import java.io.IOException;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.chiguirongos.backend.configuration.security.JPAUsersDetailsService;
import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.configuration.security.JWT.JWTSecurityUtils;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Admin Filter implementation.
 * Authenticates an admin user using the special
 * ADM cookie and checking if both the JWT and the
 * secret word contained within it, are valid.
 */

@Component
public class AdminFilter extends OncePerRequestFilter {

    @Autowired
    private JPAUsersDetailsService usersDetailsService;
    private Logger logger = LogManager.getLogger();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        logger.info("Starting admin filter");
        Cookie adminCookie = null;
        if (request.getCookies() != null) {
            adminCookie = findAdminCookie(request);
            if (adminCookie != null) {
                String cookieVal = adminCookie.getValue();
                try {
                    if (JWTSecurityUtils.validateToken(cookieVal, SecurityConstants.JWT_ADMIN_SECRET)) {
                        String jwtVal = JWTSecurityUtils.getSecretWordFromJWT(cookieVal);
                        if (jwtVal.equals(SecurityConstants.ADMIN_SECRET_WORD))
                            setAdminAuth(request);
                    }
                } catch (JwtException e) {
                    logger.error("JWT Exception: " + e.getMessage());
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                    return;
                }
            }
        }

        logger.info("Finishing admin filter");
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        return !request.getRequestURL().toString().contains("/admin/")
                && !request.getRequestURL().toString().contains("/api/all/");
    }

    /**
     * Retrieves the admin authentication/authorization cookie
     * from an HttpServletRequest.
     * 
     * @param request Request to retrieve cookie from.
     * @return The cookie ADM in case the request contains it/Null otherwise.
     */
    private Cookie findAdminCookie(HttpServletRequest request) {
        for (Cookie cookie : request.getCookies()) {
            if (!cookie.getName().equals(SecurityConstants.ADMIN_COOKIE_NAME))
                continue;

            return cookie;
        }
        return null;
    }

    /**
     * Sets the admin authentication context.
     * 
     * @param request Request made for the system.
     */
    private void setAdminAuth(HttpServletRequest request) {
        UserDetails userDetails = usersDetailsService
                .loadUserByUsername(SecurityConstants.ADMIN_USERNAME);

        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                userDetails.getUsername(),
                userDetails.getPassword(), userDetails.getAuthorities());

        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        /**
         * Shouldnt thi be S SecurityContextHolder.createEmptyContext();
         * to prevent race conditions with other threads?
         */
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
