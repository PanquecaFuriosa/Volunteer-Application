package com.chiguirongos.backend.models.utils;

/**
 * Enumerator representing the days of the week.
 */
public enum PostulationStatusEnum {
    PENDING("PENDING"),
    REJECTED("REJECTED"),
    ACCEPTED("ACCEPTED");

    private final String value;

    PostulationStatusEnum(final String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}

