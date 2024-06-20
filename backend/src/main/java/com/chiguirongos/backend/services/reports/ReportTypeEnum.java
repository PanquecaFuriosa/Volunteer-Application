package com.chiguirongos.backend.services.reports;

/**
 * Enumerator value representing the different types of 
 * reports available to generate
 */
public enum ReportTypeEnum {
    SUPPLIER_SESSIONS("SUPPLIER_SESSIONS"),
    SUPPLIER_POSTULATIONS("SUPPLIER_POSTULATIONS"),
    ADMIN_SESSIONS("ADMIN_SESSIONS"),
    ADMIN_POSTULATIONS("ADMIN_POSTULATIONS"),
    VOLUNTEER_SESSIONS("VOLUNTEER_SESSIONS");

    private final String value;

    ReportTypeEnum(final String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
