package com.chiguirongos.backend.models.works;

import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

/**
 * Entity representing an hour block that could be taken by a work.
 */
@Entity
@Table(uniqueConstraints = {@UniqueConstraint(columnNames = {"work_id", "hourBlock", "weekDay"} )})
public class WorkHourBlocks {

    @Id
    @GeneratedValue
    private Long id;            // Key of the table
    @NotNull
    private LocalTime hourBlock;
    @NotNull
    private Integer weekDay;    // An integer from -1 to 6. Check WeekDayEnum for more info

    protected WorkHourBlocks() {}
    
    public WorkHourBlocks(@NotNull LocalTime hourBlock, @NotNull Integer weekDay) {
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