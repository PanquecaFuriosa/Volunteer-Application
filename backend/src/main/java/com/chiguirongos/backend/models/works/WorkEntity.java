package com.chiguirongos.backend.models.works;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.chiguirongos.backend.models.postulations.PostulationEntity;
import com.chiguirongos.backend.models.tags.TagEntity;
import com.chiguirongos.backend.models.users.UserEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.persistence.JoinColumn;

/**
 * Represents a work entity that is stored in a relational table.
 * Each work has a generated Long value as its unique identifier.
 */
@Entity
@Table(uniqueConstraints = { @UniqueConstraint(columnNames = { "supplierId", "name" }) })
public class WorkEntity {
    @Id
    @GeneratedValue
    private Long workId;                        // Work id

    @NotNull
    @NotEmpty
    private String name;                        // Name of the work
    @NotNull
    @NotEmpty
    private String description;                 // Description of the work
    @NotNull
    @NotEmpty
    private String type;                        // Type of the work: recurrent or session
    @NotNull
    @ManyToOne
    @JoinColumn(name = "supplierId", referencedColumnName = "userId")
    private UserEntity supplierId;              // ID of the supplier that created this work

    @NotNull
    private LocalDate startDate;
    @NotNull
    private LocalDate endDate;

    @NotNull
    @Positive
    private Long volunteersNeeded;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "Work_Tags", joinColumns = { @JoinColumn(name = "workId") }, inverseJoinColumns = {
            @JoinColumn(name = "tagId") })
    private Set<TagEntity> workTags;

    @OneToMany(cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JoinColumn(name = "work_id", nullable = false)
    private Set<WorkHourBlocks> workHourBlocks;

    @OneToMany(mappedBy = "work", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private Set<PostulationEntity> workPostulations;

    protected WorkEntity() {
    }

    public WorkEntity(@NotNull @NotEmpty String name, @NotNull @NotEmpty String description,
            @NotNull @NotEmpty String type, @NotNull UserEntity supplierId, @NotNull LocalDate startDate,
            @NotNull LocalDate endDate, @NotNull @Positive Long volunteersNeeded, Set<TagEntity> workTags,
            Set<WorkHourBlocks> workHourBlocks) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.supplierId = supplierId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.volunteersNeeded = volunteersNeeded;
        this.workTags = workTags;
        this.workHourBlocks = workHourBlocks;
        this.workPostulations = new HashSet<PostulationEntity>();
    }

    // #region TAGS BLOCKS

    /**
     * Adds a work tag to the work
     * 
     * @param tag Tag to add
     */
    public void addTag(TagEntity tag) {
        if (workTags == null)
            workTags = new HashSet<>();

        if (tag.taggedWorks == null)
            tag.taggedWorks = new HashSet<>();

        tag.taggedWorks.add(this);
        workTags.add(tag);
    }

    /**
     * Removes a work tag from the work
     * 
     * @param tag Tag to remove
     */
    public void removeTag(TagEntity tag) {
        if (workTags == null)
            return;

        if (tag.taggedWorks == null)
            return;

        tag.taggedWorks.removeIf(w -> w.getWorkId().equals(workId));
        workTags.removeIf(t -> t.getTagId().equals(tag.getTagId()));
    }

    /**
     * Adds an hour block to the work
     * 
     * @param block Block to add
     */
    public void addWorkHourBlock(WorkHourBlocks block) {
        workHourBlocks.add(block);
    }

    /**
     * Removes an hour block from the work
     * 
     * @param block Block to remove
     */
    public void removeWorkHourBlock(WorkHourBlocks block) {
        workHourBlocks.remove(block);
    }
    // #endregion

    // #region POSTULATION

    /**
     * Adds a postulation to the work's postulation list
     * 
     * @param postulation Postulation to add
     */
    public void addPostulation(PostulationEntity postulation) {
        if (workPostulations == null)
            workPostulations = new HashSet<>();

        workPostulations.add(postulation);
    }

    /**
     * Remove a postulation of work's postulation list
     * 
     * @param postulation Postulation to remove
     */
    public void removePostulation(PostulationEntity postulation) {
        workPostulations.removeIf((p) -> p.getPostulationId().equals(postulation.getPostulationId()));
        postulation.setWork(null);
    }

    // #endregion

    @Override
    public String toString() {
        return String.format("Work ID %s Name %s", getWorkId(), getName());
    }

    // #region GETTERS SETTERS
    public Long getWorkId() {
        return workId;
    }

    public void setWorkId(Long workId) {
        this.workId = workId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public UserEntity getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(UserEntity supplierId) {
        this.supplierId = supplierId;
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

    public Set<TagEntity> getWorkTags() {
        return workTags;
    }

    public void setWorkTags(Set<TagEntity> workTags) {
        this.workTags = workTags;
    }

    public Set<WorkHourBlocks> getWorkHourBlocks() {
        return workHourBlocks;
    }

    public void setWorkHourBlocks(Set<WorkHourBlocks> workHourBlocks) {
        this.workHourBlocks = workHourBlocks;
    }

    public Long getVolunteersNeeded() {
        return volunteersNeeded;
    }

    public void setVolunteersNeeded(Long volunteersNeeded) {
        this.volunteersNeeded = volunteersNeeded;
    }

    public Set<PostulationEntity> getWorkPostulations() {
        return workPostulations;
    }

    public void setWorkPostulations(Set<PostulationEntity> workPostulations) {
        this.workPostulations = workPostulations;
    }
    // #endregion
}