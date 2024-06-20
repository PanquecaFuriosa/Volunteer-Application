package com.chiguirongos.backend.dtos.requestsDTO;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class DeleteWorkDTO {
    
    @NotNull
    @NotEmpty
    private String name; // Name of the work

    public DeleteWorkDTO() {
    }

    public DeleteWorkDTO(@NotNull @NotEmpty String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
