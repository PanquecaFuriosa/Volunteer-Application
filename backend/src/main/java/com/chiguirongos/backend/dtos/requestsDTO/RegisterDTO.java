package com.chiguirongos.backend.dtos.requestsDTO;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RegisterDTO {

    @NotNull
    @NotEmpty
    @Size(max = 16)
    @Pattern(regexp = "^[A-Za-z0-9]+$")
    private String username;

    @NotNull
    @NotEmpty
    @Size(min = 3)
    private String password;

    @NotNull
    @NotEmpty
    @Size(max = 64)
    private String name;

    @JsonFormat(pattern="dd-MM-yyyy")
    private LocalDate birthDate;

    private String institutionalID;

    @NotNull
    @NotEmpty
    private String role;

    public RegisterDTO(@NotNull @NotEmpty @Size(max = 16) @Pattern(regexp = "^[A-Za-z0-9]+$") String username,
            @NotNull @NotEmpty @Size(min = 3) String password, @NotNull @NotEmpty @Size(max = 64) String name,
            LocalDate birthDate, String institutionalID, @NotNull @NotEmpty String role) {
        this.username = username;
        this.password = password;
        this.name = name;
        this.birthDate = birthDate;
        this.institutionalID = institutionalID;
        this.role = role;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
}
