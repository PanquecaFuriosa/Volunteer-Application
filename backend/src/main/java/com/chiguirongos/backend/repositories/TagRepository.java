package com.chiguirongos.backend.repositories;

import org.springframework.data.repository.CrudRepository;

import com.chiguirongos.backend.models.tags.TagEntity;

/**
 * Repository interface for managing tags.
 * Provides methods for saving and retrieving ApplicationTag objects.
 */
public interface TagRepository extends CrudRepository<TagEntity, Long> {
    
    TagEntity findByName(String name);
    Boolean existsByName(String name);
}
