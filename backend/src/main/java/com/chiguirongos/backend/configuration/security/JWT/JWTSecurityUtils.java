package com.chiguirongos.backend.configuration.security.JWT;

import java.util.Date;

import org.springframework.http.HttpCookie;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.models.users.UserEntity;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

/**
 * Class containing multiple JWT utilities
 */
@Component
public class JWTSecurityUtils {

    /**
     * Tries to validate a JWT token
     * 
     * @param token Token to validate
     * @param key   Sign key
     * @return True if the token is valid/False otherwise
     */
    public static boolean validateToken(String token, String key) {
        try {
            Jwts.parser()
                    .setSigningKey(key)
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            return false;
        } catch (Exception e) {
            throw e;
        }
    }

    /**
     * Validates and obtains a JWT token's claims
     * 
     * @param token Token to get claims from
     * @param key   Sign key
     * @return JWT Token's claims
     * @throws JwtException             Thrown if the token is invalid or expired
     * @throws IllegalArgumentException Thrown if the token is empty
     */
    private static Claims getJWTClaim(String token, String key) throws JwtException, IllegalArgumentException {
        return Jwts.parser()
                .setSigningKey(key)
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Generates a JWT token using an Authentication object
     * 
     * @param auth Authentication object
     * @return Token JWT with user roles and subject
     */
    public static String generateJWTUserAuthToken(Authentication auth) {
        return Jwts.builder()
                .setSubject(auth.getName())
                .claim("role", (auth.getAuthorities().toArray()[0].toString()))
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + SecurityConstants.AUTH_JWT_TOKEN_EXPIRE_TIME))
                .signWith(SignatureAlgorithm.HS256, SecurityConstants.JWT_AUTH_SECRET)
                .compact();
    }

    /**
     * /**
     * Generates a JWT User token using an user entity
     * 
     * @param user Application user
     * @return Token JWT with user roles and subject
     */
    public static String generateJWTUserAuthToken(UserEntity user) {
        return Jwts.builder()
                .setSubject(user.getUserName())
                .claim("role", user.getRole())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + SecurityConstants.AUTH_JWT_TOKEN_EXPIRE_TIME))
                .signWith(SignatureAlgorithm.HS256, SecurityConstants.JWT_AUTH_SECRET)
                .compact();
    }

    /**
     * Extracts subject from JWT token
     * 
     * @param token Token JWT to extract subject from
     * @return JWT Token's subject
     */
    public static String getAuthUserFromJWT(String token) throws JwtException {
        return JWTSecurityUtils.getJWTClaim(token, SecurityConstants.JWT_AUTH_SECRET).getSubject();
    }

    /**
     * Creates cookie with JWT token to authenticate users
     * 
     * @param name  Cookie name
     * @param token Token to store
     * @return Resulting cookie
     */
    public static HttpCookie createJWTUserAuthCookie(String name, String token) {
        return ResponseCookie.from(name, token)
                .httpOnly(false)
                .maxAge(SecurityConstants.AUTH_COOKIE_EXPIRE_TIME)
                .path("/")
                .sameSite("Lax")
                .secure(false)
                .build();
    }

    /**
     * Gets secret word claims from ADM cookie token
     * 
     * @param token JWT Token
     * @return secret wod
     */
    public static String getSecretWordFromJWT(String token) {
        return JWTSecurityUtils.getJWTClaim(token, SecurityConstants.JWT_ADMIN_SECRET)
                .get(SecurityConstants.JWT_ADMIN_TOKEN_CLAIM, String.class);
    }

    /**
     * Generates a new JWT admin auth token.
     * 
     * @return JWT admin auth token
     */
    public static String generateJWTAdminToken() {
        return Jwts.builder()
                .claim(SecurityConstants.JWT_ADMIN_TOKEN_CLAIM, SecurityConstants.ADMIN_SECRET_WORD)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + SecurityConstants.ADMIN_JWT_EXPIRE_TIME))
                .signWith(SignatureAlgorithm.HS256, SecurityConstants.JWT_ADMIN_SECRET)
                .compact();
    }

    /**
     * Creates the ADM auth cookie with the JWT secret word token. This cookie is
     * httpOnly and only lasts 20 minutes.
     * 
     * @return ADM auth cookie.
     */
    public static HttpCookie createJWTAdminCookie() {
        return ResponseCookie.from(SecurityConstants.ADMIN_COOKIE_NAME, JWTSecurityUtils.generateJWTAdminToken())
                .httpOnly(true)
                .maxAge(SecurityConstants.ADMIN_COOKIE_EXPIRE_TIME)
                .path("/")
                .sameSite("Lax")
                .secure(false)
                .build();
    }
}
