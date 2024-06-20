package com.chiguirongos.backend.services.reports;

/**
 * Enumerator used to represent the multiple
 * file types supported when creating a report file
 */
public enum ReportFileTypeEnum {
    PDF("PDF"),
    CSV("CSV");

    private final String value;

    ReportFileTypeEnum(final String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }
}
