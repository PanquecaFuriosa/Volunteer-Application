package com.chiguirongos.backend.models.works;

import java.time.LocalDate;
import java.time.LocalTime;

import com.chiguirongos.backend.models.utils.WorkSessionStatusEnum;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Represents a work instance session block and its status
 */
@Entity
public class WorkSessionEntity {
    @Id
    @GeneratedValue
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    private WorkSessionStatusEnum status;

    @NotNull
    @PositiveOrZero
    private Integer sessionWeekDay;
    @NotNull
    private LocalDate sessionDate;
    @NotNull
    private LocalTime sessionTime;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_inst_id")
    private WorkInstanceEntity workInst;

    public WorkSessionEntity() {
    }

    public WorkSessionEntity(@NotNull @PositiveOrZero Integer sessionWeekDay, @NotNull LocalDate sessionDate,
            @NotNull LocalTime sessionTime, @NotNull WorkInstanceEntity workId) {
        this.status = WorkSessionStatusEnum.PENDING;
        this.sessionWeekDay = sessionWeekDay;
        this.sessionDate = sessionDate;
        this.sessionTime = sessionTime;
        this.workInst = workId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public WorkSessionStatusEnum getStatus() {
        return status;
    }

    public void setStatus(WorkSessionStatusEnum status) {
        this.status = status;
    }

    public Integer getSessionWeekDay() {
        return sessionWeekDay;
    }

    public void setSessionWeekDay(Integer sessionWeekDay) {
        this.sessionWeekDay = sessionWeekDay;
    }

    public LocalDate getSessionDate() {
        return sessionDate;
    }

    public void setSessionDate(LocalDate sessionDate) {
        this.sessionDate = sessionDate;
    }

    public LocalTime getSessionTime() {
        return sessionTime;
    }

    public void setSessionTime(LocalTime sessionTime) {
        this.sessionTime = sessionTime;
    }

    public WorkInstanceEntity getWorkInst() {
        return workInst;
    }

    public void setWorkInst(WorkInstanceEntity workId) {
        this.workInst = workId;
    }
}
