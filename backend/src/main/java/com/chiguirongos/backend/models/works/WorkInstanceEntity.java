package com.chiguirongos.backend.models.works;

import java.time.LocalDate;

import com.chiguirongos.backend.models.users.UserEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;

/**
 * Represents a work instance. This instance is only created when a
 * supplier accepts a potulation and works more like a contract.
 */
@Entity
public class WorkInstanceEntity {

    @Id
    @GeneratedValue
    private Long instanceId;

    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_id")
    private WorkEntity workId;
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "volunteer_id")
    private UserEntity volunteerId;

    public WorkInstanceEntity() {
    }

    public WorkInstanceEntity(@NotNull LocalDate startDate, @NotNull LocalDate endDate, @NotNull WorkEntity workId,
            @NotNull UserEntity volunteerId) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.workId = workId;
        this.volunteerId = volunteerId;
    }

    public Long getInstanceId() {
        return instanceId;
    }

    public void setInstanceId(Long instanceId) {
        this.instanceId = instanceId;
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

    public WorkEntity getWorkId() {
        return workId;
    }

    public void setWorkId(WorkEntity workId) {
        this.workId = workId;
    }

    public UserEntity getVolunteerId() {
        return volunteerId;
    }

    public void setVolunteerId(UserEntity volunteerId) {
        this.volunteerId = volunteerId;
    }
}
