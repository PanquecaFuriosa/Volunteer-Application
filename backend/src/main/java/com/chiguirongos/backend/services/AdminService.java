package com.chiguirongos.backend.services;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chiguirongos.backend.configuration.security.SecurityConstants;
import com.chiguirongos.backend.dtos.requestsDTO.EditUserDetailsDTO;
import com.chiguirongos.backend.dtos.requestsDTO.RestartPasswordDTO;
import com.chiguirongos.backend.dtos.responsesDTO.UserDTO;
import com.chiguirongos.backend.dtos.responsesDTO.UserHourBlockDTO;
import com.chiguirongos.backend.exceptions.runtime.NonExistentUserException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedRoleException;
import com.chiguirongos.backend.repositories.PostulationRepository;
import com.chiguirongos.backend.repositories.TagRepository;
import com.chiguirongos.backend.repositories.UserHourBlockRepository;
import com.chiguirongos.backend.repositories.UserRepository;
import com.chiguirongos.backend.repositories.WorkInstanceRepository;
import com.chiguirongos.backend.repositories.WorkRepository;
import com.chiguirongos.backend.repositories.WorkSessionRepository;

import jakarta.validation.Valid;

import com.chiguirongos.backend.models.tags.TagEntity;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.users.UserHourBlocks;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.models.works.WorkEntity;
import com.chiguirongos.backend.models.works.WorkInstanceEntity;

/**
 * Service containing all the logic an functionallities related to the
 * system's admins
 */
@Service
public class AdminService {

    @Autowired
    private UserRepository users;
    @Autowired
    private WorkRepository works;
    @Autowired
    private UserHourBlockRepository hours;
    @Autowired
    private TagRepository tags;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private WorkInstanceRepository workInstances;
    @Autowired
    private WorkSessionRepository workSessions;
    @Autowired
    private PostulationRepository postulations;

    /**
     * Return a list with all users in system
     * 
     * @return A List of users' details
     */
    public List<UserDTO> getUsersByPage(Integer page, Integer pageSize) {
        List<UserEntity> allUsers = users.findByUserNameNotLike(SecurityConstants.ADMIN_USERNAME,
                PageRequest.of(page, pageSize, Sort.by("userName").ascending()));

        if (allUsers.isEmpty())
            return new ArrayList<>();

        List<UserDTO> responses = new ArrayList<>();
        for (UserEntity user : allUsers) {

            List<String> tags = user.getUserTags()
                    .stream()
                    .map(t -> t.getName())
                    .toList();

            List<UserHourBlockDTO> blocks = user.getUserHourBlocks()
                    .stream()
                    .map(w -> new UserHourBlockDTO(w.getHourBlock(), w.getWeekDay()))
                    .toList();

            UserDTO dto = UserDTO.builder().id(user.getUserId())
                    .userName(user.getUserName())
                    .fullName(user.getName())
                    .birthDate(user.getBirthDate())
                    .institutionalId(user.getInstitutionalID())
                    .role(user.getRole())
                    .userTags(tags)
                    .hourBlocks(blocks)
                    .suspended(user.getSuspended())
                    .build();

            responses.add(dto);
        }

        return responses;
    }

    /**
     * Get all the users that are providers in a paginated manner
     * 
     * @param page     Page to get
     * @param pageSize Page size
     * @return Providers in a paginated way
     */
    public List<UserDTO> getProvidersByPage(Integer page, Integer pageSize) {
        List<UserEntity> allUsers = users.findByUserNameNotLikeAndRoleIn(
                SecurityConstants.ADMIN_USERNAME,
                List.of(ModelsConstants.SUPPLIER_ROLE),
                PageRequest.of(page, pageSize, Sort.by("userName").ascending()));

        if (allUsers.isEmpty())
            return new ArrayList<>();

        List<UserDTO> responses = new ArrayList<>();
        for (UserEntity user : allUsers) {

            UserDTO dto = UserDTO.builder().id(user.getUserId())
                    .userName(user.getUserName())
                    .fullName(user.getName())
                    .build();

            responses.add(dto);
        }

        return responses;
    }

    /**
     * Edit details of an user
     * 
     * @param details all user details to modify
     */
    @Transactional
    public void editUser(EditUserDetailsDTO details) {
        UserEntity user = users.findByUserName(details.getUserName());
        if (user == null)
            throw new NonExistentUserException();

        user.setName(details.getName());
        user.setBirthDate(details.getBirthDate());
        user.setInstitutionalID(details.getInstitutionalID());

        if (!user.getRole().equals(details.getRole())) {
            switch (details.getRole()) {
                case ModelsConstants.VOLUNTEER_ROLE:
                    deleteWorks(user);
                    setTagsAndWorkHours(user, details);
                    break;

                case ModelsConstants.SUPPLIER_ROLE:
                    // Remove all user's hour blocks
                    UserHourBlocks[] pervWB = user.getUserHourBlocks()
                            .toArray(new UserHourBlocks[user.getUserHourBlocks().size()]);

                    for (UserHourBlocks wb : pervWB) {
                        user.removeUserHourBlock(wb);
                        hours.deleteById(wb.getId());
                    }

                    // Remove all user's Tags
                    TagEntity[] prevTags = user.getUserTags().toArray(new TagEntity[user.getUserTags().size()]);
                    for (TagEntity pt : prevTags)
                        user.removeTag(pt);

                    deleteVolunteerWorkInstancesAndSessions(user);
                    postulations.deleteAll(user.getUserPostulations());
                    break;
                default:
                    break;
            }
        } else {
            if (user.getRole().equals(ModelsConstants.VOLUNTEER_ROLE))
                setTagsAndWorkHours(user, details);
        }

        user.setRole(details.getRole());
        users.save(user);
    }

    /**
     * Toggles the suspended status of an user
     * 
     * @param username Username of the user to toggle its suspended status
     */
    public void changeSuspendedStatus(String username) {
        UserEntity user = users.findByUserName(username);
        if (user == null)
            throw new NonExistentUserException();

        user.setSuspended(!user.getSuspended());
        users.save(user);
    }

    /**
     * Overwrite user's tags and hourBlocks
     * 
     * @param user    The user that tags and hourBlock will be overwrite
     * @param details All details to overwrite the previous tags and hourBlocks
     */
    private void setTagsAndWorkHours(UserEntity user, EditUserDetailsDTO details) {

        UserHourBlocks[] pervWB = user.getUserHourBlocks()
                .toArray(new UserHourBlocks[user.getUserHourBlocks().size()]);

        for (UserHourBlocks wb : pervWB) {
            user.removeUserHourBlock(wb);
            hours.deleteById(wb.getId());
        }

        for (UserHourBlockDTO blockDTO : details.getHourBlocks()) {
            UserHourBlocks newBlock = new UserHourBlocks(blockDTO.getHourBlock(), blockDTO.getWeekDay());
            user.addUserHourBlock(newBlock);
            hours.save(newBlock);
        }

        TagEntity[] prevTags = user.getUserTags().toArray(new TagEntity[user.getUserTags().size()]);
        for (TagEntity pt : prevTags) {
            if (details.getUserTags().stream().anyMatch(t -> t.trim().equals(pt.getName())))
                continue;

            user.removeTag(pt);
            tags.save(pt);
        }

        ArrayList<TagEntity> newUserTags = new ArrayList<>();
        for (String tag : details.getUserTags()) {
            TagEntity appTag = tags.findByName(tag.trim());
            if (appTag == null) {
                appTag = new TagEntity(tag.trim());
                tags.save(appTag);
            }
            newUserTags.add(appTag);
        }

        for (TagEntity tag : newUserTags) {
            user.addTag(tag);
            tags.save(tag);
        }
    }

    /**
     * Delete an user of system
     * 
     * @param username User's username who the admin wants to delete
     */
    @Transactional
    public void deleteUser(String username) {

        UserEntity user = users.findByUserName(username);
        if (user == null)
            throw new NonExistentUserException();

        switch (user.getRole()) {
            case ModelsConstants.SUPPLIER_ROLE:
                deleteWorks(user);
                break;

            case ModelsConstants.VOLUNTEER_ROLE:
                // Remove all user's hour blocks
                UserHourBlocks[] pervWB = user.getUserHourBlocks()
                        .toArray(new UserHourBlocks[user.getUserHourBlocks().size()]);

                for (UserHourBlocks wb : pervWB) {
                    user.removeUserHourBlock(wb);
                    hours.deleteById(wb.getId());
                }

                // Remove all user's Tags
                TagEntity[] prevTags = user.getUserTags().toArray(new TagEntity[user.getUserTags().size()]);
                for (TagEntity pt : prevTags)
                    user.removeTag(pt);

                deleteVolunteerWorkInstancesAndSessions(user);
                break;

            default:
                break;
        }

        users.delete(user);
    }

    /**
     * Set a new password to an user
     * 
     * @param details A DTO with the user to change its password and the new
     *                password
     */
    public void resetPassword(@Valid RestartPasswordDTO details) {

        UserEntity user = users.findByUserName(details.getUsername().trim());
        if (user == null)
            throw new NonExistentUserException();

        user.setPassword(encoder.encode(details.getPassword().trim()));
        users.save(user);
    }

    /**
     * Deletes a volunteer work sessions and instances
     * 
     * @param volunteer Volunteer to delete instances and sessions
     */
    private void deleteVolunteerWorkInstancesAndSessions(UserEntity volunteer) {
        Set<WorkInstanceEntity> volunteerWorksInstances = workInstances.findByVolunteerId(volunteer);
        for (WorkInstanceEntity workInstance : volunteerWorksInstances) {
            workSessions.removeByWorkInst(workInstance);
            workInstances.delete(workInstance);
        }
    }

    /**
     * Deletes all the works of a supplier. This functions does a hard delete
     * because it also deletes all the postulations and sessions related to it.
     * 
     * @param supplier Supplier to delete all its jobs
     */
    private void deleteWorks(UserEntity supplier) {
        if (!supplier.getRole().equals(ModelsConstants.SUPPLIER_ROLE))
            throw new UnauthorizedRoleException();

        Set<WorkEntity> supplierWorks = works.findBySupplierId(supplier);
        Set<WorkInstanceEntity> supplierWorksInstances = null;

        for (WorkEntity sw : supplierWorks) {
            supplierWorksInstances = workInstances.findByWorkId(sw);
            for (WorkInstanceEntity workInstance : supplierWorksInstances)
                workSessions.removeByWorkInst(workInstance);

            workInstances.deleteAll(supplierWorksInstances);
        }
        works.deleteAll(supplierWorks);
    }
}
