package com.chiguirongos.backend.services;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chiguirongos.backend.models.tags.TagEntity;
import com.chiguirongos.backend.repositories.TagRepository;

/**
 * Service containing all the business logic related to User and Work's tags.
 */
@Service
public class TagsService {
    
    @Autowired
    private TagRepository tags;

    /**
     * Gets all the tags in the system
     * 
     * @return All the tags in the system
     */
    public List<TagEntity> getTags() {
        List<TagEntity> allTags = new ArrayList<>();
        tags.findAll().forEach((t) -> allTags.add(t));
        return allTags;
    }
}
