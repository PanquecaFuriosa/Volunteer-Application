package com.chiguirongos.backend.dtos.requestsDTO;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotNull;

/**
 * DTO used to get all information about a postulation
 */
public class CreatePostulationDTO {
    
    @NotNull
    private String workName;

    @NotNull
    private String supplierUsername;

    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate startDate;

    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate endDate;

    public CreatePostulationDTO(@NotNull LocalDate startDate, @NotNull LocalDate endDate, @NotNull String workName,
            @NotNull String supplierUsername) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.workName = workName;
        this.supplierUsername = supplierUsername;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getWorkName() {
        return workName;
    }

    public void setWorkName(String workName) {
        this.workName = workName;
    }

    public String getSupplierUsername() {
        return supplierUsername;
    }

    public void setSupplierUsername(String supplierUsername) {
        this.supplierUsername = supplierUsername;
    }
}
