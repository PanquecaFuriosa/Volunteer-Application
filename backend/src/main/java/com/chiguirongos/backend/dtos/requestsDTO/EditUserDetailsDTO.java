package com.chiguirongos.backend.dtos.requestsDTO;

import java.time.LocalDate;
import java.util.List;

import com.chiguirongos.backend.dtos.responsesDTO.UserHourBlockDTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class EditUserDetailsDTO {

    @NotNull
    @NotEmpty
    private String userName;

    @NotNull
    @NotEmpty
    private String name;

    @NotNull
    private LocalDate birthDate;

    private String institutionalID;

    @NotNull
    @NotEmpty
    private String role;

    private List<String> userTags;

    private List<UserHourBlockDTO> hourBlocks;

    public EditUserDetailsDTO(@NotNull @NotEmpty String userName, @NotNull @NotEmpty String name,
            @NotNull @NotEmpty LocalDate birthDate, String institutionalID,
            @NotNull @NotEmpty String role, @NotNull @NotEmpty List<String> userTags,
            List<UserHourBlockDTO> hourBlocks) {
        this.userName = userName;
        this.name = name;
        this.birthDate = birthDate;
        this.institutionalID = institutionalID;
        this.role = role;
        this.userTags = userTags;
        this.hourBlocks = hourBlocks;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getInstitutionalID() {
        return institutionalID;
    }

    public void setInstitutionalID(String institutionalID) {
        this.institutionalID = institutionalID;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public List<String> getUserTags() {
        return userTags;
    }

    public void setUserTags(List<String> userTags) {
        this.userTags = userTags;
    }

    public List<UserHourBlockDTO> getHourBlocks() {
        return hourBlocks;
    }

    public void setHourBlocks(List<UserHourBlockDTO> hourBlocks) {
        this.hourBlocks = hourBlocks;
    }
}
