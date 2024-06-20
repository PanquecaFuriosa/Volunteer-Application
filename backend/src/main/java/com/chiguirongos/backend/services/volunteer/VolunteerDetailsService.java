package com.chiguirongos.backend.services.volunteer;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chiguirongos.backend.dtos.requestsDTO.EditPreferencesDTO;
import com.chiguirongos.backend.dtos.responsesDTO.UserDTO;
import com.chiguirongos.backend.dtos.responsesDTO.UserHourBlockDTO;
import com.chiguirongos.backend.models.tags.TagEntity;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.users.UserHourBlocks;
import com.chiguirongos.backend.repositories.TagRepository;
import com.chiguirongos.backend.repositories.UserHourBlockRepository;
import com.chiguirongos.backend.repositories.UserRepository;

/**
 * Service that handles all the operations related to a
 * volunteer user preferences.
 */
@Service
public class VolunteerDetailsService {

    @Autowired
    private UserRepository users;
    @Autowired
    private TagRepository tags;
    @Autowired
    private UserHourBlockRepository hours;

    /**
     * Edit user's preferences
     * 
     * @param preference A DTO with all user's new preferences
     * @param username   User's username who want to change its preferences
     */
    public void editUserPreferences(UserEntity volunteer, EditPreferencesDTO preference) {
        UserHourBlocks[] pervWB = volunteer.getUserHourBlocks()
                .toArray(new UserHourBlocks[volunteer.getUserHourBlocks().size()]);

        for (UserHourBlocks wb : pervWB) {
            volunteer.removeUserHourBlock(wb);
            hours.deleteById(wb.getId());
        }

        for (UserHourBlockDTO blockDTO : preference.getHourBlocks()) {
            UserHourBlocks newBlock = new UserHourBlocks(blockDTO.getHourBlock(), blockDTO.getWeekDay());
            volunteer.addUserHourBlock(newBlock);
            hours.save(newBlock);
        }

        TagEntity[] prevTags = volunteer.getUserTags().toArray(new TagEntity[volunteer.getUserTags().size()]);
        for (TagEntity pt : prevTags) {
            if (preference.getUserTags().stream().anyMatch(t -> t.trim().equals(pt.getName())))
                continue;

            volunteer.removeTag(pt);
            tags.save(pt);
        }

        ArrayList<TagEntity> newUserTags = new ArrayList<>();
        for (String tag : preference.getUserTags()) {
            TagEntity appTag = tags.findByName(tag.trim());
            if (appTag == null) {
                appTag = new TagEntity(tag.trim());
                tags.save(appTag);
            }
            newUserTags.add(appTag);
        }

        for (TagEntity tag : newUserTags) {
            volunteer.addTag(tag);
            tags.save(tag);
        }

        users.save(volunteer);
    }

    /**
     * Get all user's details
     * 
     * @param username User's username who wants to see its details
     * @return A DTO with all user's details
     */
    public UserDTO getDetails(UserEntity volunteer) {

        List<String> tags = volunteer.getUserTags()
                .stream()
                .map(t -> t.getName())
                .toList();

        List<UserHourBlockDTO> blocks = volunteer.getUserHourBlocks()
                .stream()
                .map(w -> new UserHourBlockDTO(w.getHourBlock(), w.getWeekDay()))
                .toList();

        return UserDTO.builder()
                .id(volunteer.getUserId())
                .userName(volunteer.getUserName())
                .fullName(volunteer.getName())
                .birthDate(volunteer.getBirthDate())
                .institutionalId(volunteer.getInstitutionalID())
                .userTags(tags)
                .hourBlocks(blocks)
                .build();
    }

    /**
     * Get user's preferences
     * 
     * @param username User's to retrieve its preferences
     * @return A DTO with the user preferences
     */
    public UserDTO getPreferences(UserEntity volunteer) {

        List<String> tags = volunteer.getUserTags()
                .stream()
                .map(t -> t.getName())
                .toList();

        List<UserHourBlockDTO> blocks = volunteer.getUserHourBlocks()
                .stream()
                .map(w -> new UserHourBlockDTO(w.getHourBlock(), w.getWeekDay()))
                .toList();

        return UserDTO.builder()
                .id(volunteer.getUserId())
                .userName(volunteer.getUserName())
                .userTags(tags)
                .hourBlocks(blocks)
                .build();
    }
}
