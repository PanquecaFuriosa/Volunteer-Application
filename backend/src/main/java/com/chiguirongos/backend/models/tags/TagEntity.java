package com.chiguirongos.backend.models.tags;

import java.util.Set;

import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.works.WorkEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;

/**
 * Entity class representing a tag in the application.
 */
@Entity
public class TagEntity {    
    @Id
    @GeneratedValue
    private Long tagId;                 // ID of the tag

    @Column(unique = true, length = 16) 
    private String name;                // Name of the tag

    @ManyToMany(mappedBy = "workTags")
    public Set<WorkEntity> taggedWorks; // Works tagged with this tag
    
    @ManyToMany(mappedBy = "userTags")
    public Set<UserEntity> taggedUser;  // Users tagged with this tag

    protected TagEntity() {}

    public TagEntity(String name) {
        this.name = name;
    }

    public Long getTagId() {
        return tagId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
    
    @Override
    public String toString() {
        return String.format("Tag ID %s Name %s", getTagId(), getName());
    }
}
