package com.chiguirongos.backend.dtos.requestsDTO;

import java.time.LocalDate;
import java.util.ArrayList;

import com.chiguirongos.backend.dtos.WorkHourBlockDTO;
import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

/**
 * DTO containing the info needed to edit an existing work.
 * Used for transferring work data between layers of the application.
 */
public class EditWorkDTO {

    @NotNull
    @NotEmpty
    private String name; // Name of the work

    private String newName; // Name of the work

    private String description; // Description of the work

    @NotNull
    @NotEmpty
    private String type; // Type of the work: recurrent or session

    @NotNull
    @NotEmpty
    private ArrayList<String> tags;

    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate startDate;
    @NotNull
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate endDate;

    @NotNull
    @Positive
    private Long volunteersNeeded;

    @NotNull
    @NotEmpty
    private WorkHourBlockDTO[] hourBlocks;

    public EditWorkDTO() {
    }

    public EditWorkDTO(@NotNull @NotEmpty String name, String newName, String description,
            @NotNull @NotEmpty String type, @NotNull @NotEmpty ArrayList<String> tags,
            @NotNull LocalDate startDate, @NotNull LocalDate endDate,
            @NotNull @Positive Long volunteersNeeded, @NotNull @NotEmpty WorkHourBlockDTO[] hourBlocks) {
        this.name = name;
        this.newName = newName;
        this.description = description;
        this.type = type;
        this.tags = tags;
        this.startDate = startDate;
        this.endDate = endDate;
        this.volunteersNeeded = volunteersNeeded;
        this.hourBlocks = hourBlocks;
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

    public ArrayList<String> getTags() {
        return tags;
    }

    public void setTags(ArrayList<String> tags) {
        this.tags = tags;
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

    public WorkHourBlockDTO[] getHourBlocks() {
        return hourBlocks;
    }

    public void setHourBlocks(WorkHourBlockDTO[] hourBlocks) {
        this.hourBlocks = hourBlocks;
    }

    public Long getVolunteersNeeded() {
        return volunteersNeeded;
    }

    public void setVolunteersNeeded(Long volunteersNeeded) {
        this.volunteersNeeded = volunteersNeeded;
    }

    public String getNewName() {
        return newName;
    }

    public void setNewName(String newName) {
        this.newName = newName;
    }
}
