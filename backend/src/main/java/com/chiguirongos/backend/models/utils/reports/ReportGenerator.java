package com.chiguirongos.backend.models.utils.reports;

public interface ReportGenerator {
    public void writeRow(String[] row);
    public void finish();
}
