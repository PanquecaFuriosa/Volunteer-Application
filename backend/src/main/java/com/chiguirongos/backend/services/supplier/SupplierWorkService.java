package com.chiguirongos.backend.services.supplier;

import java.security.InvalidParameterException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chiguirongos.backend.dtos.WorkHourBlockDTO;
import com.chiguirongos.backend.dtos.requestsDTO.CreateWorkDTO;
import com.chiguirongos.backend.dtos.requestsDTO.DeleteWorkDTO;
import com.chiguirongos.backend.dtos.requestsDTO.EditWorkDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkDTO;
import com.chiguirongos.backend.exceptions.runtime.NonExistentWorkException;
import com.chiguirongos.backend.models.tags.TagEntity;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.models.utils.PostulationStatusEnum;
import com.chiguirongos.backend.models.works.WorkEntity;
import com.chiguirongos.backend.models.works.WorkHourBlocks;
import com.chiguirongos.backend.models.works.WorkInstanceEntity;
import com.chiguirongos.backend.models.works.WorkSessionEntity;
import com.chiguirongos.backend.repositories.TagRepository;
import com.chiguirongos.backend.repositories.WorkHourBlockRepository;
import com.chiguirongos.backend.repositories.WorkInstanceRepository;
import com.chiguirongos.backend.repositories.WorkRepository;
import com.chiguirongos.backend.repositories.WorkSessionRepository;

/**
 * Service containing all the logic and functionalities related to the
 * management of works by suppliers.
 */
@Service
public class SupplierWorkService {

    @Autowired
    private WorkRepository works;
    @Autowired
    private TagRepository tags;
    @Autowired
    private WorkHourBlockRepository hours;
    @Autowired
    private WorkInstanceRepository workInstances;
    @Autowired
    private WorkSessionRepository workSessions;

    /**
     * Creates a new work defined on the work param
     * 
     * @param username Username of the supplier creating the work
     * @param work     Dto containing enough info to create a work by a supplier
     */
    public void createSupplierWork(UserEntity supplier, CreateWorkDTO work) {
        String workType;
        switch (work.getType().trim()) {
            case ModelsConstants.WORK_TYPE_RECURRING:
                workType = ModelsConstants.WORK_TYPE_RECURRING;
                break;
            case ModelsConstants.WORK_TYPE_SESSION:
                workType = ModelsConstants.WORK_TYPE_SESSION;
                break;
            default:
                throw new InvalidParameterException("Work type not recognized");
        }

        if (works.existsByNameAndSupplierId(work.getName().trim(), supplier))
            throw new IllegalArgumentException("Work with same name and supplier already exists!");

        ArrayList<TagEntity> workTags = new ArrayList<>();
        for (String tag : work.getTags()) {
            TagEntity appTag = tags.findByName(tag.trim());
            if (appTag == null) {
                appTag = new TagEntity(tag.trim());
                tags.save(appTag);
            }
            workTags.add(appTag);
        }

        WorkEntity newWork = new WorkEntity(work.getName().trim(), work.getDescription(),
                workType, supplier, work.getStartDate(), work.getEndDate(), work.getVolunteersNeeded(),
                new HashSet<>(), new HashSet<>());

        for (TagEntity tag : workTags) {
            newWork.addTag(tag);
            tags.save(tag);
        }

        newWork = works.save(newWork);

        for (WorkHourBlockDTO blockDTO : work.getHourBlocks()) {
            WorkHourBlocks newBlock = new WorkHourBlocks(
                    blockDTO.getHourBlock(),
                    blockDTO.getWeekDay());
            newWork.getWorkHourBlocks().add(newBlock);
            hours.save(newBlock);
        }
    }

    /**
     * Edits a job already in the databases
     * 
     * @param username Username of the supplier creating the work
     * @param work     DTO with the info to edit a job in the db
     */
    public void editSupplierWork(UserEntity supplier, EditWorkDTO work) {
        switch (work.getType().trim()) {
            case ModelsConstants.WORK_TYPE_RECURRING:
            case ModelsConstants.WORK_TYPE_SESSION:
                break;
            default:
                throw new InvalidParameterException("Work type not recognized");
        }

        WorkEntity appWork = works.findByNameAndSupplierId(work.getName(), supplier);
        if (appWork == null)
            throw new IllegalArgumentException("Work doesnt exists!");

        if (appWork.getWorkPostulations() != null)
            if (appWork.getWorkPostulations().stream()
                    .filter((p) -> !p.getStatus().equals(PostulationStatusEnum.REJECTED)).count() > 0)
                throw new IllegalArgumentException("Can't edit a work with postulations already accepted or pending.");

        if (work.getNewName() != null) {
            if (works.existsByNameAndSupplierId(work.getNewName(), supplier))
                throw new IllegalArgumentException("Another work with the same name and supplier already exists");

            appWork.setName(work.getNewName());
        }

        appWork.setType(work.getType().trim());
        appWork.setDescription(work.getDescription());
        appWork.setStartDate(work.getStartDate());
        appWork.setEndDate(work.getEndDate());
        appWork.setVolunteersNeeded(work.getVolunteersNeeded());

        WorkHourBlocks[] prevWB = appWork.getWorkHourBlocks()
                .toArray(new WorkHourBlocks[appWork.getWorkHourBlocks().size()]);
        for (WorkHourBlocks wb : prevWB) {
            appWork.removeWorkHourBlock(wb);
            hours.deleteById(wb.getId());
        }

        for (WorkHourBlockDTO blockDTO : work.getHourBlocks()) {
            WorkHourBlocks newBlock = new WorkHourBlocks(blockDTO.getHourBlock(), blockDTO.getWeekDay());
            appWork.addWorkHourBlock(newBlock);
            hours.save(newBlock);
        }

        TagEntity[] prevTags = appWork.getWorkTags().toArray(new TagEntity[appWork.getWorkTags().size()]);
        for (TagEntity pt : prevTags) {
            if (work.getTags().stream().anyMatch(t -> t.trim().equals(pt.getName())))
                continue;

            appWork.removeTag(pt);
            tags.save(pt);
        }

        ArrayList<TagEntity> newWorkTags = new ArrayList<>();
        for (String tag : work.getTags()) {
            TagEntity appTag = tags.findByName(tag.trim());
            if (appTag == null) {
                appTag = new TagEntity(tag.trim());
                tags.save(appTag);
            }
            newWorkTags.add(appTag);
        }

        for (TagEntity tag : newWorkTags) {
            appWork.addTag(tag);
            tags.save(tag);
        }

        works.save(appWork);
    }

    /**
     * Get all the works from a supplier in a specific month and year.
     * 
     * @param username Username of the supplier to retrieve works from
     * @param month    Month to retrieve works from
     * @param year     Year to retrieve works from
     * @return A list of works where the month and year are between the start date
     *         and end date of the work
     */
    public List<WorkDTO> getSupplierWorksInMonthYear(UserEntity supplier,
            Integer month, Integer year) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = LocalDate.of(year, month, monthStart.getMonth().length(monthStart.isLeapYear()));

        Set<WorkEntity> supplierWorks = works.findSupplierWorksBetweenDates(supplier, monthStart, monthEnd);

        if (supplierWorks.isEmpty())
            return new ArrayList<>();

        List<WorkDTO> responses = new ArrayList<>();
        for (WorkEntity work : supplierWorks) {
            List<WorkHourBlockDTO> blocks = work.getWorkHourBlocks()
                    .stream()
                    .map((hb) -> new WorkHourBlockDTO(hb.getHourBlock(), hb.getWeekDay()))
                    .toList();

            List<String> tags = work.getWorkTags()
                    .stream()
                    .map((t) -> t.getName())
                    .toList();

            Long pendingPostulationsCount = work.getWorkPostulations()
                    .stream()
                    .filter((p) -> p.getStatus().equals(PostulationStatusEnum.PENDING))
                    .count();

            responses.add(WorkDTO.builder()
                    .id(work.getWorkId())
                    .name(work.getName())
                    .description(work.getDescription())
                    .type(work.getType())
                    .startDate(work.getStartDate())
                    .endDate(work.getEndDate())
                    .volunteersNeeded(work.getVolunteersNeeded())
                    .hours(blocks)
                    .tags(tags)
                    .pendingPostulationsCount(pendingPostulationsCount)
                    .build());
        }

        return responses;
    }

    /**
     * Delete a work created by a supplier
     * 
     * @param username username of the supplier creating the work
     * @param delReq   name of the work and the supplier that created it
     */
    public void deleteSupplierWork(UserEntity supplier, DeleteWorkDTO delReq) {
        WorkEntity toDel = works.findByNameAndSupplierId(delReq.getName(), supplier);
        if (toDel == null)
            throw new NonExistentWorkException();

        Set<WorkInstanceEntity> instances = workInstances.findByWorkId(toDel);
        Set<WorkSessionEntity> sessions = workSessions.findByWorkInstIn(instances);

        workSessions.deleteAll(sessions);
        workInstances.deleteAll(instances);
        works.delete(toDel);
    }
}
