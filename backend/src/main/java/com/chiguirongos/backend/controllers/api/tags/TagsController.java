package com.chiguirongos.backend.controllers.api.tags;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.chiguirongos.backend.services.TagsService;

@RestController
public class TagsController {

    @Autowired
    private TagsService tagsService;
    private Logger logger = LogManager.getLogger();

    /**
     * Retrieves all tags from the system.
     * 
     * @return A list containing all the tags in the system/BAD REQUEST otherwise
     */
    @GetMapping("/api/all/tags")
    public ResponseEntity<List<String>> getAllTags() {
        try {
            return ResponseEntity.ok()
                    .body(tagsService.getTags().stream()
                            .map((t) -> t.getName()).toList());
        } catch (Exception e) {
            logger.error(e);
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}
