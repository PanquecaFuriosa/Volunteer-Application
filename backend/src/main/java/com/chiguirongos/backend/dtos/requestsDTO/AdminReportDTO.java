package com.chiguirongos.backend.dtos.requestsDTO;

import java.time.LocalDate;
import java.util.List;

import com.chiguirongos.backend.services.reports.ReportFileTypeEnum;
import com.chiguirongos.backend.services.reports.ReportTypeEnum;

import jakarta.validation.constraints.NotNull;

/**
 * DTO used to get all information about an admin report
 */
public class AdminReportDTO {
    @NotNull
    private LocalDate start;

    @NotNull
    private LocalDate end;

    @NotNull
    private ReportTypeEnum reportType;

    @NotNull
    private ReportFileTypeEnum fileType;

    @NotNull
    private List<String> targetUsers;

    public AdminReportDTO(@NotNull LocalDate start, @NotNull LocalDate end, @NotNull ReportTypeEnum reportType,
            @NotNull ReportFileTypeEnum fileType, @NotNull List<String> targetUsers) {
        this.start = start;
        this.end = end;
        this.reportType = reportType;
        this.fileType = fileType;
        this.targetUsers = targetUsers;
    }

    public LocalDate getStart() {
        return start;
    }

    public void setStart(LocalDate start) {
        this.start = start;
    }

    public LocalDate getEnd() {
        return end;
    }

    public void setEnd(LocalDate end) {
        this.end = end;
    }

    public ReportTypeEnum getReportType() {
        return reportType;
    }

    public void setReportType(ReportTypeEnum reportType) {
        this.reportType = reportType;
    }

    public ReportFileTypeEnum getFileType() {
        return fileType;
    }

    public void setFileType(ReportFileTypeEnum fileType) {
        this.fileType = fileType;
    }

    public List<String> getTargetUsers() {
        return targetUsers;
    }

    public void setTargetUsers(List<String> targetUsers) {
        this.targetUsers = targetUsers;
    }
}
