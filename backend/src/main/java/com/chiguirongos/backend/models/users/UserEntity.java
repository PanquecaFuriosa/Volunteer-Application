package com.chiguirongos.backend.models.users;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.chiguirongos.backend.models.postulations.PostulationEntity;
import com.chiguirongos.backend.models.tags.TagEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

/**
 * Entity representing an user of the aplication
 */
@Entity
public class UserEntity {

    @Id
    @GeneratedValue
    private Long userId;                // User id

    @Column(unique = true, length = 16)
    @NotNull
    @NotEmpty
    private String userName;            // User username

    @Column(length = 64)
    @NotNull
    @NotEmpty
    private String name;                // User fullname

    @NotNull
    private LocalDate birthDate;        // User birthdate

    @NotNull
    @NotEmpty
    private String password;            // User pasword

    private String institutionalID;     // User institutional id

    @NotNull
    @NotEmpty
    private String role;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "User_Tags", joinColumns = { @JoinColumn(name = "userId") }, inverseJoinColumns = {
            @JoinColumn(name = "tagId") })
    private Set<TagEntity> userTags;    // User preferred works tags

    @OneToMany(cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private Set<UserHourBlocks> userHourBlocks;     // User preferred hour blocks

    @NotNull
    private Boolean suspended;

    @OneToMany(mappedBy = "volunteer", cascade = CascadeType.REMOVE, orphanRemoval = true, fetch = FetchType.EAGER)
    private Set<PostulationEntity> userPostulations;    // Postulations made by the user

    protected UserEntity() {
    }

    public UserEntity(@NotNull @NotEmpty String userName, @NotNull @NotEmpty String name, @NotNull LocalDate birthDate,
            @NotNull @NotEmpty String password, String institutionalID,
            @NotNull @NotEmpty String role) {
        this.userName = userName;
        this.name = name;
        this.birthDate = birthDate;
        this.password = password;
        this.institutionalID = institutionalID;
        this.role = role;
        this.userTags = new HashSet<TagEntity>();
        this.userHourBlocks = new HashSet<UserHourBlocks>();
        this.suspended = false;
        this.userPostulations = new HashSet<PostulationEntity>();
    }

    // #region POSTULATIONS

    /**
     * remove a postulation of user's postulations list
     * 
     * @param postulation Postulation to remove
     */
    public void removePostulation(PostulationEntity postulation) {
        userPostulations.removeIf((p) -> p.getPostulationId().equals(postulation.getPostulationId()));
        postulation.setVolunteer(null);
    }

    /**
     * add a postulation to the user's postulations list
     * 
     * @param postulation Postulation to add
     */
    public void addPostulation(PostulationEntity postulation) {
        if (userPostulations == null)
            userPostulations = new HashSet<>();

        userPostulations.add(postulation);
    }
    // #endregion

    // #region PREFERENCES
    /**
     * Adds a tag to the user's preferences
     * and also to the tag's users.
     * 
     * @param tag Tag to add
     */
    public void addTag(TagEntity tag) {
        if (userTags == null)
            userTags = new HashSet<>();

        if (tag.taggedUser == null)
            tag.taggedUser = new HashSet<>();

        tag.taggedUser.add(this);
        userTags.add(tag);
    }

    /**
     * Removes a tag from the user's preferences
     * and also from the tag's users.
     * 
     * @param tag Tag to remove
     */
    public void removeTag(TagEntity tag) {
        if (userTags == null)
            return;

        if (tag.taggedUser == null)
            return;

        tag.taggedUser.removeIf(u -> u.getUserId().equals(userId));
        userTags.removeIf(t -> t.getTagId().equals(tag.getTagId()));
    }

    /**
     * Adds an hour block to the user preferences
     * 
     * @param block Block to add
     */
    public void addUserHourBlock(UserHourBlocks block) {
        if (userHourBlocks == null)
            userHourBlocks = new HashSet<>();

        userHourBlocks.add(block);
    }

    /**
     * Removes an hour block from the user preferences
     * 
     * @param block Block to remove
     */
    public void removeUserHourBlock(UserHourBlocks block) {
        if (userHourBlocks == null)
            return;

        userHourBlocks.remove(block);
    }
    // #endregion

    // #region GETTERS SETTERS
    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public Set<TagEntity> getUserTags() {
        return userTags;
    }

    public void setUserTags(Set<TagEntity> userTags) {
        this.userTags = userTags;
    }

    public Set<UserHourBlocks> getUserHourBlocks() {
        return userHourBlocks;
    }

    public void setUserHourBlocks(Set<UserHourBlocks> userHourBlocks) {
        this.userHourBlocks = userHourBlocks;
    }

    public void setSuspended(Boolean suspended) {
        this.suspended = suspended;
    }

    public Boolean getSuspended() {
        return suspended;
    }

    public Set<PostulationEntity> getUserPostulations() {
        return userPostulations;
    }

    public void setUserPostulations(Set<PostulationEntity> userPostulations) {
        this.userPostulations = userPostulations;
    }
    // #endregion
}
