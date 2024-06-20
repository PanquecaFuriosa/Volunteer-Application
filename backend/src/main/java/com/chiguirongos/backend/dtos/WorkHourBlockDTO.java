package com.chiguirongos.backend.dtos;

import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public class WorkHourBlockDTO {

    @NotNull
    @NotEmpty
    @JsonFormat(pattern="HH:mm:ss")
    private LocalTime hourBlock;
    
    @NotNull
    @NotEmpty
    private Integer weekDay;

    public WorkHourBlockDTO() {
    }

    public WorkHourBlockDTO(@NotNull @NotEmpty LocalTime hourBlock, @NotNull @NotEmpty Integer weekDay) {
        this.hourBlock = hourBlock;
        this.weekDay = weekDay;
    }

    public LocalTime getHourBlock() {
        return hourBlock;
    }

    public void setHourBlock(LocalTime hourBlock) {
        this.hourBlock = hourBlock;
    }

    public Integer getWeekDay() {
        return weekDay;
    }

    public void setWeekDay(Integer weekDay) {
        this.weekDay = weekDay;
    }
}