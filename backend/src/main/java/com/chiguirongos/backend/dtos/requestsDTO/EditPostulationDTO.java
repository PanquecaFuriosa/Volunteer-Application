package com.chiguirongos.backend.dtos.requestsDTO;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotNull;

/**
 * DTO containing all the information to edit a a postulation
 */
public class EditPostulationDTO {

    @NotNull
    private Long postulationId;

    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate startDate;

    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate endDate;

    public EditPostulationDTO() {
    }

    public EditPostulationDTO(@NotNull Long postulationId, @NotNull LocalDate startDate, @NotNull LocalDate endDate) {
        this.postulationId = postulationId;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public Long getPostulationId() {
        return postulationId;
    }

    public void setPostulationId(Long postulationId) {
        this.postulationId = postulationId;
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
}
