package com.chiguirongos.backend.dtos.responsesDTO;

import java.time.LocalDate;

import com.chiguirongos.backend.models.utils.PostulationStatusEnum;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO used to send all information about a postulation
 */
@JsonInclude(Include.NON_NULL)
 public class PostulationDTO {

    @NotNull
    private Long postulationId;
    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate startDate;
    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate endDate;
    @NotNull
    private PostulationStatusEnum status;

    private WorkDTO work = null;
    private String volunteerUsername = null;
    private String volunteerFullname = null;

    public PostulationDTO() {
    }

    public PostulationDTO(@NotNull Long postulationId, @NotNull LocalDate startDate, @NotNull LocalDate endDate,
            @NotNull PostulationStatusEnum status, WorkDTO work, String volunteerUsername, String volunteerFullname) {
        this.postulationId = postulationId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
        this.work = work;
        this.volunteerUsername = volunteerUsername;
        this.volunteerFullname = volunteerFullname;
    }

    public static Id builder() {
        return new Builder();
    }

    public interface Id {
        Status postulationId(@NotNull Long postulationId);
    }

    public interface Status {
        StartDate status(@NotNull PostulationStatusEnum status);
    }

    public interface StartDate {
        EndDate startDate(@NotNull LocalDate startDate);
    }

    public interface EndDate {
        Build endDate(@NotNull LocalDate endDate);
    }

    public interface Build {
        Build work(@NotNull WorkDTO work);

        Build volunteerUsername(@NotBlank String volunteerUsername);

        Build volunteerFullname(@NotBlank String volunteerFullname);

        PostulationDTO build();
    }

    private static class Builder implements Id, Status, StartDate, EndDate, Build {

        @NotNull
        private Long postulationId;
        @NotNull
        private LocalDate startDate;
        @NotNull
        private LocalDate endDate;
        @NotNull
        private PostulationStatusEnum status;

        private WorkDTO work = null;
        private String volunteerUsername = null;
        private String volunteerFullname = null;

        @Override
        public Status postulationId(@NotNull Long postulationId) {
            this.postulationId = postulationId;
            return this;
        }

        @Override
        public StartDate status(@NotNull PostulationStatusEnum status) {
            this.status = status;
            return this;
        }

        @Override
        public EndDate startDate(@NotNull LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        @Override
        public Build endDate(@NotNull LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        @Override
        public Build work(@NotNull WorkDTO work) {
            this.work = work;
            return this;
        }

        @Override
        public Build volunteerUsername(@NotBlank String volunteerUsername) {
            this.volunteerUsername = volunteerUsername;
            return this;
        }

        @Override
        public Build volunteerFullname(@NotBlank String volunteerFullname) {
            this.volunteerFullname = volunteerFullname;
            return this;
        }

        @Override
        public PostulationDTO build() {
            return new PostulationDTO(postulationId, startDate, endDate, status, work, volunteerUsername,
                    volunteerFullname);
        }
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

    public PostulationStatusEnum getStatus() {
        return status;
    }

    public void setStatus(PostulationStatusEnum status) {
        this.status = status;
    }

    public WorkDTO getWork() {
        return work;
    }

    public void setWork(WorkDTO work) {
        this.work = work;
    }

    public String getVolunteerUsername() {
        return volunteerUsername;
    }

    public void setVolunteerUsername(String volunteerUsername) {
        this.volunteerUsername = volunteerUsername;
    }

    public String getVolunteerFullname() {
        return volunteerFullname;
    }

    public void setVolunteerFullname(String volunteerFullname) {
        this.volunteerFullname = volunteerFullname;
    }
}