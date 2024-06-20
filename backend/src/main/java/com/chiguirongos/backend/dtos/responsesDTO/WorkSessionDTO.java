package com.chiguirongos.backend.dtos.responsesDTO;

import java.time.LocalDate;
import java.time.LocalTime;

import com.chiguirongos.backend.models.utils.WorkSessionStatusEnum;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@JsonInclude(Include.NON_NULL)
public class WorkSessionDTO {

    @NotNull
    private Long id;
    @NotNull
    private WorkSessionStatusEnum status;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate date = null;
    private LocalTime time = null;
    private String workName = null;
    private String volunteerUsername = null;
    private String volunteerFullname = null;

    public WorkSessionDTO() {
    }

    public WorkSessionDTO(@NotNull Long id, @NotNull WorkSessionStatusEnum status, LocalDate date, LocalTime time,
            String workName, String volunteerUsername, String volunteerFullname) {
        this.id = id;
        this.status = status;
        this.date = date;
        this.time = time;
        this.workName = workName;
        this.volunteerUsername = volunteerUsername;
        this.volunteerFullname = volunteerFullname;
    }

    public static Id builder() {
        return new Builder();
    }

    public interface Id {
        Status id(@NotNull Long id);
    }

    public interface Status {
        Build status(@NotNull WorkSessionStatusEnum status);
    }

    public interface Build {
        Build date(@NotNull LocalDate date);

        Build time(@NotNull LocalTime time);

        Build workName(@NotBlank String workName);

        Build volunteerUsername(@NotBlank String volunteerUsername);

        Build volunteerFullname(@NotBlank String volunteerFullname);

        WorkSessionDTO build();
    }

    private static class Builder implements Id, Status, Build {

        @NotNull
        private Long id;
        @NotNull
        private WorkSessionStatusEnum status;

        private LocalDate date = null;
        private LocalTime time = null;
        private String workName = null;
        private String volunteerUsername = null;
        private String volunteerFullname = null;

        @Override
        public Status id(@NotNull Long id) {
            this.id = id;
            return this;
        }

        @Override
        public Build status(@NotNull WorkSessionStatusEnum status) {
            this.status = status;
            return this;
        }

        @Override
        public Build date(@NotNull LocalDate date) {
            this.date = date;
            return this;
        }

        @Override
        public Build time(@NotNull LocalTime time) {
            this.time = time;
            return this;
        }

        @Override
        public Build workName(@NotBlank String workName) {
            this.workName = workName;
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
        public WorkSessionDTO build() {
            return new WorkSessionDTO(id, status, date, time, workName, volunteerUsername, volunteerFullname);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public WorkSessionStatusEnum getStatus() {
        return status;
    }

    public void setStatus(WorkSessionStatusEnum status) {
        this.status = status;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
    }

    public String getWorkName() {
        return workName;
    }

    public void setWorkName(String workName) {
        this.workName = workName;
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

    // public WorkSessionDTO(WorkSessionEntity session) {
    // UserEntity sessionVolunteer = session.getWorkInst().getVolunteerId();
    // this.id = session.getId();
    // this.status = session.getStatus();
    // this.volunteerUsername = sessionVolunteer.getUserName();
    // this.volunteerFullname = sessionVolunteer.getName();
    // }
}
