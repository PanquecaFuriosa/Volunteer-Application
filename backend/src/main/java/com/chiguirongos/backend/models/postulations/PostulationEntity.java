package com.chiguirongos.backend.models.postulations;

import java.time.LocalDate;

import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.PostulationStatusEnum;
import com.chiguirongos.backend.models.works.WorkEntity;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.validation.constraints.NotNull;

/**
 * Entity class representing a volunteer postulation to a work
 */
@Entity
public class PostulationEntity {

    @Id
    @GeneratedValue
    private Long postulationId;             // Postulation id

    @NotNull
    private LocalDate startDate;            // Postulation start date

    @NotNull
    private LocalDate endDate;              // Postulation end date

    @NotNull
    private LocalDate postulationDate;      // Postulation creation date

    @NotNull
    @Enumerated(EnumType.STRING)
    private PostulationStatusEnum status;   // Postulation status

    // volunteer who made the postulation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity volunteer;           // Volunteer that made the postulation

    // work which the volunteer wants to postulate
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_id", nullable = false)
    private WorkEntity work;                // Work related to the postulation

    protected PostulationEntity() {}

    public PostulationEntity(@NotNull LocalDate starDate, @NotNull LocalDate endDate, @NotNull UserEntity volunteer, @NotNull WorkEntity work) {
        this.startDate = starDate;
        this.endDate = endDate;
        this.volunteer = volunteer;
        this.postulationDate = LocalDate.now();
        this.status = PostulationStatusEnum.PENDING;
        this.work = work;
    }

    public Long getPostulationId() {
        return postulationId;
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

    public LocalDate getPostulationDate() {
        return postulationDate;
    }

    public void setPostulationDate(LocalDate postulationDate) {
        this.postulationDate = postulationDate;
    }

    public PostulationStatusEnum getStatus() {
        return status;
    }

    public void setStatus(PostulationStatusEnum status) {
        this.status = status;
    }

    public void setPostulationId(Long postulationId) {
        this.postulationId = postulationId;
    }

    public UserEntity getVolunteer() {
        return volunteer;
    }

    public void setVolunteer(UserEntity volunteer) {
        this.volunteer = volunteer;
    }

    public WorkEntity getWork() {
        return work;
    }

    public void setWork(WorkEntity work) {
        this.work = work;
    }
}