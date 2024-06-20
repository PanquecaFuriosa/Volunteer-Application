package com.chiguirongos.backend.services.volunteer;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.chiguirongos.backend.dtos.requestsDTO.EditPostulationDTO;
import com.chiguirongos.backend.dtos.WorkHourBlockDTO;
import com.chiguirongos.backend.dtos.requestsDTO.CreatePostulationDTO;
import com.chiguirongos.backend.dtos.responsesDTO.PostulationDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkDTO;
import com.chiguirongos.backend.exceptions.runtime.NonExistentPostulationException;
import com.chiguirongos.backend.exceptions.runtime.NonExistentUserException;
import com.chiguirongos.backend.exceptions.runtime.NonExistentWorkException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedRoleException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedUserAccessException;
import com.chiguirongos.backend.models.postulations.PostulationEntity;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.models.utils.PostulationStatusEnum;
import com.chiguirongos.backend.models.works.WorkEntity;
import com.chiguirongos.backend.models.works.WorkHourBlocks;
import com.chiguirongos.backend.repositories.PostulationRepository;
import com.chiguirongos.backend.repositories.UserRepository;
import com.chiguirongos.backend.repositories.WorkRepository;

/**
 * Service to managed all logic about users' postulation
 */
@Service
public class VolunteerPostulationService {

    @Autowired
    private UserRepository users;
    @Autowired
    private WorkRepository works;
    @Autowired
    private PostulationRepository postulations;

    /**
     * Creates a new postulation
     * 
     * @param username           User's usarname who wants to create a postulation
     * @param postulationDetails all details of new postulation
     */
    public void postulateUser(UserEntity volunteer, CreatePostulationDTO postulationDetails) {

        // check if the work's supplier exists
        UserEntity supplier = users.findByUserName(postulationDetails.getSupplierUsername());
        if (supplier == null)
            throw new NonExistentUserException();

        if (!supplier.getRole().equals(ModelsConstants.SUPPLIER_ROLE))
            throw new UnauthorizedRoleException();

        // check if the work exists
        WorkEntity work = works.findByNameAndSupplierId(postulationDetails.getWorkName(), supplier);
        if (work == null)
            throw new NonExistentWorkException();

        validatePostulationDatesForWork(postulationDetails.getStartDate(), postulationDetails.getEndDate(), work);

        validatePostulationHourBlocks(volunteer, postulationDetails.getStartDate(), postulationDetails.getEndDate(),
                work, null);

        PostulationEntity postulation = postulations.findByVolunteerAndWork(volunteer, work);
        if (postulation != null) {
            if (postulation.getStatus().equals(PostulationStatusEnum.PENDING)
                    || postulation.getStatus().equals(PostulationStatusEnum.ACCEPTED))
                throw new IllegalArgumentException("The user already have a pending postulation to that work");

            postulation.setStartDate(postulationDetails.getStartDate());
            postulation.setEndDate(postulationDetails.getEndDate());
            postulation.setStatus(PostulationStatusEnum.PENDING);
            // FIXME DISABLED ONLY FOR TESTING!
            // postulation.setPostulationDate(LocalDate.now());
        } else {
            postulation = new PostulationEntity(postulationDetails.getStartDate(), postulationDetails.getEndDate(),
                    volunteer, work);

            volunteer.addPostulation(postulation);
            work.addPostulation(postulation);
        }

        postulations.save(postulation);
        users.save(volunteer);
        works.save(work);
    }

    public PostulationDTO getWorkUserPostulation(UserEntity volunteer, Long workId) {

        PostulationEntity postulation = postulations.findByVolunteerAndWorkId(volunteer, workId);
        if (postulation == null)
            return null;

        WorkEntity work = postulation.getWork();
        WorkDTO workDTO = WorkDTO.builder()
                .id(work.getWorkId())
                .name(work.getName())
                .supplierUsername(work.getSupplierId().getUserName())
                .build();

        return PostulationDTO.builder()
                .postulationId(postulation.getPostulationId())
                .status(postulation.getStatus())
                .startDate(postulation.getStartDate())
                .endDate(postulation.getEndDate())
                .volunteerUsername(volunteer.getUserName())
                .volunteerFullname(volunteer.getName())
                .work(workDTO)
                .build();
    }

    /**
     * Gets all user's postulations
     * 
     * @param username User's username who we want to find all postulations
     * @return A list with all user's postulations
     */
    public List<PostulationDTO> getVolunteerPostulations(UserEntity volunteer) {

        Set<PostulationEntity> userPostulations = volunteer.getUserPostulations();
        if (userPostulations.isEmpty())
            return new ArrayList<>();

        List<PostulationDTO> responses = new ArrayList<>();

        for (PostulationEntity postulation : userPostulations) {
            WorkEntity work = postulation.getWork();
            WorkDTO workDTO = WorkDTO.builder()
                    .id(work.getWorkId())
                    .name(work.getName())
                    .supplierUsername(work.getSupplierId().getUserName())
                    .build();

            responses.add(PostulationDTO.builder()
                    .postulationId(postulation.getPostulationId())
                    .status(postulation.getStatus())
                    .startDate(postulation.getStartDate())
                    .endDate(postulation.getEndDate())
                    .volunteerUsername(volunteer.getUserName())
                    .volunteerFullname(volunteer.getName())
                    .work(workDTO)
                    .build());
        }

        return responses;
    }

    /**
     * Gets all user's postulations using pages
     * 
     * @param username User who requiered get its postulations
     * @param page     Number of page
     * @param pageSize Length of the list to return
     * @return A list with length equals to pageSize and the postulations in the
     *         requiered page
     */
    public List<PostulationDTO> getPagedVolunteerPostulations(UserEntity volunteer, Integer page,
            Integer pageSize) {

        List<PostulationEntity> allPostulations = postulations.findByVolunteer(volunteer,
                PageRequest.of(page, pageSize, Sort.by("startDate").descending()));

        if (allPostulations.isEmpty())
            return new ArrayList<>();

        List<PostulationDTO> responses = new ArrayList<>();
        for (PostulationEntity postulation : allPostulations) {
            WorkEntity work = postulation.getWork();
            List<WorkHourBlockDTO> blocks = work.getWorkHourBlocks()
                    .stream()
                    .map((hb) -> new WorkHourBlockDTO(hb.getHourBlock(), hb.getWeekDay()))
                    .toList();

            List<String> tags = work.getWorkTags()
                    .stream()
                    .map((t) -> t.getName())
                    .toList();

            WorkDTO workDTO = WorkDTO.builder()
                    .id(work.getWorkId())
                    .name(work.getName())
                    .description(work.getDescription())
                    .supplierName(work.getSupplierId().getName())
                    .supplierUsername(work.getSupplierId().getUserName())
                    .type(work.getType())
                    .volunteersNeeded(work.getVolunteersNeeded())
                    .startDate(work.getStartDate())
                    .endDate(work.getEndDate())
                    .hours(blocks)
                    .tags(tags)
                    .build();

            PostulationDTO postDTO = PostulationDTO.builder()
                    .postulationId(postulation.getPostulationId())
                    .status(postulation.getStatus())
                    .startDate(postulation.getStartDate())
                    .endDate(postulation.getEndDate())
                    .volunteerFullname(volunteer.getName())
                    .volunteerUsername(volunteer.getUserName())
                    .work(workDTO)
                    .build();

            responses.add(postDTO);
        }

        return responses;
    }

    /**
     * Cancels a postulation
     * 
     * @param username      The user who wants to remove one of his postulations
     * @param postulationId The postulation to remove
     */
    public void cancelPostulation(UserEntity volunteer, Long postulationId) {

        PostulationEntity postulation = postulations.findById(postulationId).orElse(null);
        if (postulation == null)
            throw new NonExistentPostulationException();

        if (postulation.getVolunteer().getUserId() != volunteer.getUserId())
            throw new UnauthorizedUserAccessException();

        if (!postulation.getStatus().equals(PostulationStatusEnum.PENDING))
            throw new IllegalArgumentException("User can't remove a postulation which status is not pending");

        volunteer.removePostulation(postulation);
        postulation.getWork().removePostulation(postulation);

        postulations.delete(postulation);
    }

    /**
     * Edits a postulation start and end dates
     * 
     * @param username Creator of the postulation
     * @param editR    DTO with the postulation to edit id, new start and end dates
     */
    public void editPostulation(UserEntity volunteer, EditPostulationDTO editR) {

        PostulationEntity postulation = postulations.findById(editR.getPostulationId()).orElse(null);
        if (postulation == null)
            throw new NonExistentPostulationException();

        if (postulation.getVolunteer().getUserId() != volunteer.getUserId())
            throw new UnauthorizedUserAccessException();

        if (!postulation.getStatus().equals(PostulationStatusEnum.PENDING))
            throw new IllegalArgumentException("User can't edit a postulation which status is not pending");

        validatePostulationDatesForWork(editR.getStartDate(), editR.getEndDate(), postulation.getWork());

        validatePostulationHourBlocks(volunteer, editR.getStartDate(), editR.getEndDate(), postulation.getWork(),
                postulation);

        postulation.setStartDate(editR.getStartDate());
        postulation.setEndDate(editR.getEndDate());
        postulations.save(postulation);
    }

    /**
     * Retrieves the work related to a postulation
     * 
     * @param username      Username of the postulated used
     * @param postulationId Postulation ID
     * @return Work DTO containing all the information related to the postulation
     *         work
     */
    public WorkDTO getPostulationWork(UserEntity volunteer, Long postulationId) {

        PostulationEntity postulation = postulations.findById(postulationId).orElse(null);
        if (postulation == null)
            throw new NonExistentPostulationException();

        if (postulation.getVolunteer().getUserId() != volunteer.getUserId())
            throw new UnauthorizedUserAccessException();

        WorkEntity postWork = postulation.getWork();
        List<WorkHourBlockDTO> blocks = postWork.getWorkHourBlocks()
                .stream()
                .map((hb) -> new WorkHourBlockDTO(hb.getHourBlock(), hb.getWeekDay()))
                .toList();

        List<String> tags = postWork.getWorkTags()
                .stream()
                .map((t) -> t.getName())
                .toList();

        return WorkDTO.builder()
                .id(postWork.getWorkId())
                .name(postWork.getName())
                .description(postWork.getDescription())
                .type(postWork.getType())
                .startDate(postWork.getStartDate())
                .endDate(postWork.getEndDate())
                .hours(blocks)
                .tags(tags)
                .build();
    }

    /**
     * Tries to validate two probable start and end dates for a postulation
     * in a specific work
     * 
     * @param startDate Postulation start date
     * @param endDate   Postulation end date
     * @param work      Postulation target work
     */
    private void validatePostulationDatesForWork(LocalDate startDate, LocalDate endDate, WorkEntity work) {
        if (work.getStartDate().isAfter(startDate)
                || startDate.isAfter(work.getEndDate()))
            throw new IllegalArgumentException("Postulation's dates outside work's time range");

        if (work.getStartDate().isAfter(endDate)
                || endDate.isAfter(work.getEndDate()))
            throw new IllegalArgumentException("Postulation's dates outside work's time range");

        if (startDate.isAfter(endDate))
            throw new IllegalArgumentException("Postulation's start date is after");

        if (LocalDate.now().isAfter(endDate))
            throw new IllegalArgumentException("Postulation's end date can't be in the past");

        if (LocalDate.now().isAfter(work.getEndDate()))
            throw new IllegalArgumentException("Can't postulate to a work thta is already finished");
    }

    /**
     * Check if exists a postulation in any hou
     * 
     * @param volunteer           the volunteer who wants make the postulation
     * @param startDate           the postulation's start date
     * @param endDate             the postulation's end date
     * @param work                the work which the volunteer wants to postulate
     * @param previousPostulation if you want edit a postulation
     */
    private void validatePostulationHourBlocks(UserEntity volunteer, LocalDate startDate, LocalDate endDate,
            WorkEntity work, PostulationEntity previousPostulation) {

        Set<PostulationEntity> volunteerPostulations = postulations.findVolunteerPostulationsBetweenDatesAndStatusIn(
                volunteer, startDate, endDate, List.of(PostulationStatusEnum.ACCEPTED, PostulationStatusEnum.PENDING));

        Set<WorkHourBlocks> newPostulationHourBlocks = work.getWorkHourBlocks();

        for (PostulationEntity existingPost : volunteerPostulations) {
            if (previousPostulation != null
                    && previousPostulation.getPostulationId().equals(existingPost.getPostulationId())) {
                continue;
            }

            WorkEntity existingWork = existingPost.getWork();
            for (WorkHourBlocks phb : existingWork.getWorkHourBlocks()) {
                for (WorkHourBlocks hb : newPostulationHourBlocks) {

                    Integer existingWD = (phb.getWeekDay() == -1
                            ? (existingWork.getStartDate().getDayOfWeek().getValue() % 7)
                            : phb.getWeekDay());

                    Integer newPostWD = (hb.getWeekDay() == -1
                            ? (work.getStartDate().getDayOfWeek().getValue() % 7)
                            : hb.getWeekDay());

                    if (phb.getHourBlock().equals(hb.getHourBlock()) && newPostWD.equals(existingWD)) {
                        throw new IllegalArgumentException(
                                "You can't postulate in an hour block which you already have a postulation");
                    }
                }
            }
        }
    }
}
