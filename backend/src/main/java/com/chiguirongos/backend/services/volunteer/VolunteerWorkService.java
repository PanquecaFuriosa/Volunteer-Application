package com.chiguirongos.backend.services.volunteer;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chiguirongos.backend.dtos.WorkHourBlockDTO;
import com.chiguirongos.backend.dtos.responsesDTO.UserHourBlockDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkSessionDTO;
import com.chiguirongos.backend.exceptions.runtime.NonExistentWorkSessionException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedUserAccessException;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.models.utils.PostulationStatusEnum;
import com.chiguirongos.backend.models.works.WorkEntity;
import com.chiguirongos.backend.models.works.WorkSessionEntity;
import com.chiguirongos.backend.repositories.PostulationRepository;
import com.chiguirongos.backend.repositories.WorkInstanceRepository;
import com.chiguirongos.backend.repositories.WorkRepository;
import com.chiguirongos.backend.repositories.WorkSessionRepository;

@Service
public class VolunteerWorkService {

    @Autowired
    private WorkRepository works;
    @Autowired
    private WorkInstanceRepository workInstances;
    @Autowired
    private WorkSessionRepository workSessions;
    @Autowired
    private PostulationRepository postulations;

    /**
     * Get all works available in a certain month and year
     * 
     * @param month Month to retrieve works from
     * @param year  Year to retrieve works from
     * @return All works available in a certain month and year
     */
    public List<WorkDTO> getVolunteersWorksInMonthYear(UserEntity volunteer, Integer month, Integer year) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = LocalDate.of(year, month, monthStart.getMonth().length(monthStart.isLeapYear()));

        Set<WorkEntity> volunteerWorks = works.findWorksBetweenDates(monthStart, monthEnd);
        if (volunteerWorks.isEmpty())
            return new ArrayList<>();

        List<WorkDTO> responses = new ArrayList<>();
        for (WorkEntity work : volunteerWorks) {
            Long instancesNumber = workInstances.countByWorkId(work);
            Boolean isPostulated = postulations.existsByVolunteerAndWorkAndStatusIn(volunteer, work,
                    List.of(PostulationStatusEnum.PENDING, PostulationStatusEnum.ACCEPTED));

            if (work.getVolunteersNeeded() <= instancesNumber && !isPostulated)
                continue;

            List<WorkHourBlockDTO> blocks = work.getWorkHourBlocks()
                    .stream()
                    .map((hb) -> new WorkHourBlockDTO(hb.getHourBlock(), hb.getWeekDay()))
                    .toList();

            List<String> tags = work.getWorkTags()
                    .stream()
                    .map((t) -> t.getName())
                    .toList();

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
                    .supplierName(work.getSupplierId().getName())
                    .supplierUsername(work.getSupplierId().getUserName())
                    .isPostulated(isPostulated)
                    .build());
        }

        return responses;
    }

    /**
     * Get all works available in a certain month and year that
     * have a hour block match with specific preferred hour blocks
     * from an user
     * 
     * @param prefBlocks User preferred hour blocks
     * @param month      Month to retrieve works from
     * @param year       Year to retrieve works from
     * @return All works available in a certain month and year
     *         with hour blocks preferred by the user
     */
    public List<WorkDTO> getVolunteerPreferredWorks(UserEntity volunteer,
            List<UserHourBlockDTO> prefBlocks,
            Integer month,
            Integer year) {

        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = LocalDate.of(year, month, monthStart.getMonth().length(monthStart.isLeapYear()));

        // First we get the works in the month and year
        Set<WorkEntity> volunteerWorks = works.findWorksBetweenDates(monthStart, monthEnd);
        if (volunteerWorks.isEmpty())
            return new ArrayList<>();

        /**
         * Next we filter them by checking out if they have a hour block that matches
         * one of the user preferred blocks
         */
        List<WorkDTO> responses = new ArrayList<>();
        for (WorkEntity work : volunteerWorks) {
            Long instancesNumber = workInstances.countByWorkId(work);
            // Check if the volunteer has a postulation to this work
            Boolean isPostulated = postulations.existsByVolunteerAndWorkAndStatusIn(volunteer, work,
                    List.of(PostulationStatusEnum.PENDING, PostulationStatusEnum.ACCEPTED));
            if (work.getVolunteersNeeded() <= instancesNumber && !isPostulated)
                continue;

            Boolean matchingBlock = false;
            for (UserHourBlockDTO phb : prefBlocks) {
                if (hasMatchingBlock(work, phb.getWeekDay(), phb.getHourBlock()) || isPostulated) {
                    matchingBlock = true;
                    break;
                }
            }

            if (!matchingBlock)
                continue;

            List<WorkHourBlockDTO> blocks = work.getWorkHourBlocks()
                    .stream()
                    .map((hb) -> new WorkHourBlockDTO(hb.getHourBlock(), hb.getWeekDay()))
                    .toList();

            List<String> tags = work.getWorkTags()
                    .stream()
                    .map((t) -> t.getName())
                    .toList();

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
                    .supplierName(work.getSupplierId().getName())
                    .supplierUsername(work.getSupplierId().getUserName())
                    .isPostulated(isPostulated)
                    .build());
        }

        /**
         * If there is no work available with the user preferrences, we return
         * all the jobs in that month and year.
         */
        if (responses.size() == 0)
            return getVolunteersWorksInMonthYear(volunteer, month, year);

        return responses;
    }

    /**
     * Gets the work sessions status of a volunteer in a specific month and year.
     * 
     * @param volunteer Volunteer to get sessions from
     * @param month     Month to get sessions from
     * @param year      Year to get sessions from
     * @return List containing all the work sessions statuses of the volunteer in
     *         the month and year specified
     */
    public List<WorkSessionDTO> getVolunteerWorkSessions(UserEntity volunteer, Integer month, Integer year) {
        LocalDate monthStart = LocalDate.of(year, month, 1);
        LocalDate monthEnd = LocalDate.of(year, month, monthStart.getMonth().length(monthStart.isLeapYear()));
        Set<WorkSessionEntity> sessions = workSessions.findVolunteerWorkSessionsBetweenDates(volunteer, monthStart,
                monthEnd);

        List<WorkSessionDTO> dtos = new ArrayList<>();
        for (WorkSessionEntity session : sessions) {
            dtos.add(WorkSessionDTO.builder()
                    .id(session.getId())
                    .status(session.getStatus())
                    .date(session.getSessionDate())
                    .time(session.getSessionTime())
                    .workName(session.getWorkInst().getWorkId().getName())
                    .build());
        }
        return dtos;
    }

    /**
     * Retrieves the work information related to a work session.
     * 
     * @param volunteer Volunteer of the session
     * @param sessionId Work Session id
     * @return DTO containing the work information.
     */
    public WorkDTO getWorkFromSession(UserEntity volunteer, Long sessionId) {
        WorkSessionEntity session = workSessions.findById(sessionId)
                .orElseThrow(() -> new NonExistentWorkSessionException());

        if (!session.getWorkInst().getVolunteerId().getUserId().equals(volunteer.getUserId()))
            throw new UnauthorizedUserAccessException();

        WorkEntity work = session.getWorkInst().getWorkId();
        List<WorkHourBlockDTO> blocks = work.getWorkHourBlocks()
                .stream()
                .map((hb) -> new WorkHourBlockDTO(hb.getHourBlock(), hb.getWeekDay()))
                .toList();

        List<String> tags = work.getWorkTags()
                .stream()
                .map((t) -> t.getName())
                .toList();

        return WorkDTO.builder()
                .id(work.getWorkId())
                .name(work.getName())
                .description(work.getDescription())
                .type(work.getType())
                .startDate(work.getStartDate())
                .endDate(work.getEndDate())
                .volunteersNeeded(work.getVolunteersNeeded())
                .hours(blocks)
                .tags(tags)
                .build();
    }

    /**
     * Calculates if the work has a matching block in a specific day of
     * the week and an hour block.
     * 
     * @param weekDay Week day to match
     * @param hour    Hour block to match
     * @return True if the work has a matching block.
     */
    private Boolean hasMatchingBlock(WorkEntity work, Integer weekDay, LocalTime hour) {

        switch (work.getType()) {
            case ModelsConstants.WORK_TYPE_SESSION:

                if (!weekDay.equals(work.getStartDate().getDayOfWeek().getValue() % 7))
                    return false;

                return work.getWorkHourBlocks().stream().anyMatch((hb) -> {
                    return hb.getHourBlock().getHour() == hour.getHour();
                });

            case ModelsConstants.WORK_TYPE_RECURRING:
                return work.getWorkHourBlocks().stream().anyMatch((hb) -> {
                    return weekDay.equals(hb.getWeekDay()) && hb.getHourBlock().getHour() == hour.getHour();
                });

            default:
                throw new IllegalArgumentException("Wrong work type found: " + work.getType());
        }
    }
}
