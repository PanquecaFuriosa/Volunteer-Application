package com.chiguirongos.backend.dtos.requestsDTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RestartPasswordDTO {
    
    @NotNull
    @NotEmpty
    @Size(max = 16)
    @Pattern(regexp = "^[A-Za-z0-9]+$")
    private String username;
    private String password;

    public RestartPasswordDTO(String username, String password) {
        this.username = username;
        this.password = password;
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
}