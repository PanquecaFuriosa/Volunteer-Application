package com.chiguirongos.backend.models.utils;

/**
 * Enumerator used to represent the multiple 
 * status a work session can have
 */
public enum WorkSessionStatusEnum {
    PENDING("PENDING"),
    ACCEPTED("ACCEPTED"),
    REJECTED("REJECTED");

    private final String value;

    WorkSessionStatusEnum(final String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
