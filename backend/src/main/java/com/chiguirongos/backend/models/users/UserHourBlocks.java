package com.chiguirongos.backend.models.users;

import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

/**
 * Entity that represent an user preferred hour block and week day
 */
@Entity
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"user_id", "hourBlock", "weekDay"} )})
public class UserHourBlocks {
    @Id
    @GeneratedValue
    private Long id;

    @NotNull
    private LocalTime hourBlock;

    @NotNull
    private Integer weekDay; // An integer from 0 to 6 indicating the preferred week day

    protected UserHourBlocks() {}
    
    public UserHourBlocks (@NotNull LocalTime hourBlock, @NotNull Integer weekDay) {
        this.hourBlock = hourBlock;
        this.weekDay = weekDay;
    }

    public Long getId() {
        return id;
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
