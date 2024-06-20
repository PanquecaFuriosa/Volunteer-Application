package com.chiguirongos.backend.dtos.responsesDTO;

import java.time.LocalDate;
import java.util.List;

import com.chiguirongos.backend.dtos.WorkHourBlockDTO;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

@JsonInclude(Include.NON_NULL)
public class WorkDTO {

    @NotNull
    private Long id;
    @NotBlank
    private String name;

    private String description = null;
    private String type = null;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate startDate = null;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate endDate = null;

    @Positive
    private Long volunteersNeeded = null;

    private List<String> tags = null;
    private List<WorkHourBlockDTO> hours = null;

    private String supplierName = null;
    private String supplierUsername = null;

    @PositiveOrZero
    private Long pendingPostulationsCount = null;
    private Boolean isPostulated = null;

    public WorkDTO() {
    }

    public WorkDTO(@NotNull Long id, @NotBlank String name, String description, String type, LocalDate startDate,
            LocalDate endDate, @Positive Long volunteersNeeded, List<String> tags, List<WorkHourBlockDTO> hours,
            String supplierName, String supplierUsername, @PositiveOrZero Long pendingPostulationsCount,
            Boolean isPostulated) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.startDate = startDate;
        this.endDate = endDate;
        this.volunteersNeeded = volunteersNeeded;
        this.tags = tags;
        this.hours = hours;
        this.supplierName = supplierName;
        this.supplierUsername = supplierUsername;
        this.pendingPostulationsCount = pendingPostulationsCount;
        this.isPostulated = isPostulated;
    }

    public static Id builder() {
        return new Builder();
    }

    public interface Id {
        Name id(@NotNull Long id);
    }

    public interface Name {
        Build name(@NotBlank String name);
    }

    public interface Build {
        Build description(@NotBlank String description);

        Build type(@NotBlank String type);

        Build startDate(@NotNull LocalDate startDate);

        Build endDate(@NotNull LocalDate endDate);

        Build volunteersNeeded(@Positive Long volunteersNeeded);

        Build tags(@NotEmpty List<String> tags);

        Build hours(@NotEmpty List<WorkHourBlockDTO> hours);

        Build supplierName(@NotBlank String supplierName);

        Build supplierUsername(@NotBlank String supplierUsername);

        Build pendingPostulationsCount(@PositiveOrZero Long pendingPostulationsCount);

        Build isPostulated(@NotNull Boolean isPostulated);

        WorkDTO build();
    }

    private static class Builder implements Id, Name, Build {

        @NotNull
        private Long id;
        @NotBlank
        private String name;

        private String description = null;
        private String type = null;

        private LocalDate startDate = null;
        private LocalDate endDate = null;

        @Positive
        private Long volunteersNeeded = null;

        private List<String> tags = null;
        private List<WorkHourBlockDTO> hours = null;

        private String supplierName = null;
        private String supplierUsername = null;

        @PositiveOrZero
        private Long pendingPostulationsCount = null;
        private Boolean isPostulated = null;

        @Override
        public Name id(@NotNull Long id) {
            this.id = id;
            return this;
        }

        @Override
        public Build name(@NotBlank String name) {
            this.name = name;
            return this;
        }

        @Override
        public Build description(@NotBlank String description) {
            this.description = description;
            return this;
        }

        @Override
        public Build type(@NotBlank String type) {
            this.type = type;
            return this;
        }

        @Override
        public Build startDate(@NotNull LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        @Override
        public Build endDate(@NotNull LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        @Override
        public Build volunteersNeeded(@Positive Long volunteersNeeded) {
            this.volunteersNeeded = volunteersNeeded;
            return this;
        }

        @Override
        public Build tags(@NotEmpty List<String> tags) {
            this.tags = tags;
            return this;
        }

        @Override
        public Build hours(@NotEmpty List<WorkHourBlockDTO> hours) {
            this.hours = hours;
            return this;
        }

        @Override
        public Build supplierName(@NotBlank String supplierName) {
            this.supplierName = supplierName;
            return this;
        }

        @Override
        public Build supplierUsername(@NotBlank String supplierUsername) {
            this.supplierUsername = supplierUsername;
            return this;
        }

        @Override
        public Build pendingPostulationsCount(@PositiveOrZero Long pendingPostulationsCount) {
            this.pendingPostulationsCount = pendingPostulationsCount;
            return this;
        }

        @Override
        public Build isPostulated(@NotNull Boolean isPostulated) {
            this.isPostulated = isPostulated;
            return this;
        }

        @Override
        public WorkDTO build() {
            return new WorkDTO(id, name, description, type, startDate, endDate, volunteersNeeded, tags, hours,
                    supplierName, supplierUsername, pendingPostulationsCount, isPostulated);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public Long getVolunteersNeeded() {
        return volunteersNeeded;
    }

    public void setVolunteersNeeded(Long volunteersNeeded) {
        this.volunteersNeeded = volunteersNeeded;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public List<WorkHourBlockDTO> getHours() {
        return hours;
    }

    public void setHours(List<WorkHourBlockDTO> hours) {
        this.hours = hours;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getSupplierUsername() {
        return supplierUsername;
    }

    public void setSupplierUsername(String supplierUsername) {
        this.supplierUsername = supplierUsername;
    }

    public Long getPendingPostulationsCount() {
        return pendingPostulationsCount;
    }

    public void setPendingPostulationsCount(Long pendingPostulationsCount) {
        this.pendingPostulationsCount = pendingPostulationsCount;
    }

    public Boolean getIsPostulated() {
        return isPostulated;
    }

    public void setIsPostulated(Boolean isPostulated) {
        this.isPostulated = isPostulated;
    }
}
