package com.chiguirongos.backend.dtos.responsesDTO;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonInclude.Include;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@JsonInclude(Include.NON_NULL)
public class UserDTO {

    @NotNull
    private Long id;
    @NotBlank
    private String userName;
    private String fullName = null;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate birthDate = null;
    private String institutionalID = null;

    private String role = null;
    private List<String> userTags = null;
    private List<UserHourBlockDTO> hourBlocks = null;
    private Boolean suspended = null;

    public UserDTO() {
    }

    public UserDTO(@NotNull Long id, @NotBlank String userName, String fullName, LocalDate birthDate,
            String institutionalID, String role, List<String> userTags, List<UserHourBlockDTO> hourBlocks,
            Boolean suspended) {
        this.id = id;
        this.userName = userName;
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.institutionalID = institutionalID;
        this.role = role;
        this.userTags = userTags;
        this.hourBlocks = hourBlocks;
        this.suspended = suspended;
    }

    public static Id builder() {
        return new Builder();
    }

    public interface Id {
        Username id(@NotNull Long id);
    }

    public interface Username {
        Build userName(@NotBlank String userName);
    }

    public interface Build {
        Build fullName(@NotBlank String fullName);

        Build birthDate(@NotNull LocalDate birthDate);

        Build institutionalId(@NotBlank String institutionalId);

        Build role(@NotBlank String role);

        Build userTags(@NotNull List<String> userTags);

        Build hourBlocks(@NotNull List<UserHourBlockDTO> hourBlocks);

        Build suspended(@NotNull Boolean suspended);

        UserDTO build();
    }

    private static class Builder implements Id, Username, Build {

        @NotNull
        private Long id;
        @NotBlank
        private String userName;
        private String fullName = null;
        private LocalDate birthDate = null;
        private String institutionalID = null;
        private String role = null;
        private List<String> userTags = null;
        private List<UserHourBlockDTO> hourBlocks = null;
        private Boolean suspended = null;

        @Override
        public Username id(@NotNull Long id) {
            this.id = id;
            return this;
        }

        @Override
        public Build userName(@NotBlank String userName) {
            this.userName = userName;
            return this;
        }

        @Override
        public Build fullName(@NotBlank String fullName) {
            this.fullName = fullName;
            return this;
        }

        @Override
        public Build birthDate(@NotNull LocalDate birthDate) {
            this.birthDate = birthDate;
            return this;
        }

        @Override
        public Build institutionalId(@NotBlank String institutionalId) {
            this.institutionalID = institutionalId;
            return this;
        }

        @Override
        public Build role(@NotBlank String role) {
            this.role = role;
            return this;
        }

        @Override
        public Build userTags(@NotNull List<String> userTags) {
            this.userTags = userTags;
            return this;
        }

        @Override
        public Build hourBlocks(@NotNull List<UserHourBlockDTO> hourBlocks) {
            this.hourBlocks = hourBlocks;
            return this;
        }

        @Override
        public Build suspended(@NotNull Boolean suspended) {
            this.suspended = suspended;
            return this;
        }

        @Override
        public UserDTO build() {
            return new UserDTO(id, userName, fullName, birthDate, institutionalID, role, userTags, hourBlocks, suspended);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public Boolean getSuspended() {
        return suspended;
    }

    public void setSuspended(Boolean suspended) {
        this.suspended = suspended;
    }
}
