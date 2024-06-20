package com.chiguirongos.backend.configuration.security;

/**
 * Constants used in Spring Security
 */
public class SecurityConstants {
    /** Security cookies names  **/
    public static final String AUTH_COOKIE_NAME = "JWT";
    public static final String ADMIN_COOKIE_NAME = "ADM";
    
    /** JWT cookie max age time */
    public static final Long AUTH_COOKIE_EXPIRE_TIME = 86400l; //1 day
    public static final Integer ADMIN_COOKIE_EXPIRE_TIME = 1200;
    public static final Integer AUTH_JWT_TOKEN_EXPIRE_TIME = 86400000;
    public static final Integer ADMIN_JWT_EXPIRE_TIME = 1200000;
    
    public static final String JWT_ADMIN_TOKEN_CLAIM = "terces";
    
    /** Tokens secret words and signs */
    public static final String ADMIN_SECRET_WORD = "SOFTWARE";
    public static final String JWT_AUTH_SECRET = "BANANA";
    public static final String JWT_ADMIN_SECRET = "PATILLA";

    /** Admin credentials */
    public static final String ADMIN_USERNAME = "AUSTRALIA";
}
