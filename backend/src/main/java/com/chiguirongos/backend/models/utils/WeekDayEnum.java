package com.chiguirongos.backend.models.utils;

/**
 * Enumerator representing the days of the week.
 */
public enum WeekDayEnum {
    NONE(-1),
    SUNDAY(0),
    MONDAY(1),
    TUESDAY(2),
    WEDNESDAY(3),
    THURSDAY(4),
    FRIDAY(5),
    SATURDAY(6);

    private final Integer value;

    WeekDayEnum(final Integer value) {
        this.value = value;
    }

    public Integer getValue() {
        return value;
    }
}
