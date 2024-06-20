package com.chiguirongos.backend.services.supplier;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chiguirongos.backend.dtos.WorkHourBlockDTO;
import com.chiguirongos.backend.dtos.responsesDTO.PostulationDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkDTO;
import com.chiguirongos.backend.exceptions.runtime.NonExistentPostulationException;
import com.chiguirongos.backend.exceptions.runtime.NonExistentUserException;
import com.chiguirongos.backend.exceptions.runtime.NonExistentWorkException;
import com.chiguirongos.backend.exceptions.runtime.SuspendedUserException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedRoleException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedUserAccessException;
import com.chiguirongos.backend.models.postulations.PostulationEntity;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.models.utils.PostulationStatusEnum;
import com.chiguirongos.backend.models.works.WorkEntity;
import com.chiguirongos.backend.models.works.WorkHourBlocks;
import com.chiguirongos.backend.models.works.WorkInstanceEntity;
import com.chiguirongos.backend.models.works.WorkSessionEntity;
import com.chiguirongos.backend.repositories.PostulationRepository;
import com.chiguirongos.backend.repositories.WorkInstanceRepository;
import com.chiguirongos.backend.repositories.WorkRepository;
import com.chiguirongos.backend.repositories.WorkSessionRepository;

/**
 * Service used to handle all the postulations operation
 * that can be made by a supplier.
 */
@Service
public class SupplierPostulationService {

    @Autowired
    private PostulationRepository postulations;
    @Autowired
    private WorkRepository works;
    @Autowired
    private WorkInstanceRepository workInstances;
    @Autowired
    private WorkSessionRepository workSessions;

    /**
     * Rejects a volunteer postulation
     * 
     * @param supplierUsername User who wants to reject a postulation
     * @param postulationId    ID of the postulation to reject
     */
    public void rejectUserPostulation(UserEntity supplier, Long postulationId)
            throws NonExistentUserException, SuspendedUserException, NonExistentPostulationException {
        PostulationEntity postulation = postulations.findById(postulationId).orElse(null);

        if (!supplier.getRole().equals(ModelsConstants.SUPPLIER_ROLE))
            throw new UnauthorizedRoleException();

        if (postulation == null)
            throw new NonExistentPostulationException();

        if (!postulation.getStatus().equals(PostulationStatusEnum.PENDING))
            throw new IllegalArgumentException("Supplier can't reject a postulation which status is not pending");

        if ((!postulation.getWork().getSupplierId().getUserId().equals(supplier.getUserId())))
            throw new UnauthorizedUserAccessException();

        postulation.setStatus(PostulationStatusEnum.REJECTED);

        postulations.save(postulation);
    }

    /**
     * Accepts a volunteer postulation
     * 
     * @param supplierUsername User who wants to accept a postulation
     * @param postulationId    ID of the postulation to accept
     */
    @Transactional
    public void acceptUserPostulation(UserEntity supplier, Long postulationId)
            throws NonExistentUserException, SuspendedUserException, NonExistentPostulationException {
        PostulationEntity postulation = postulations.findById(postulationId).orElse(null);

        if (!supplier.getRole().equals(ModelsConstants.SUPPLIER_ROLE))
            throw new UnauthorizedRoleException();

        if (postulation == null)
            throw new NonExistentPostulationException();

        if (!postulation.getStatus().equals(PostulationStatusEnum.PENDING))
            throw new IllegalArgumentException("Supplier can't accept a postulation which status is not pending");

        if ((!postulation.getWork().getSupplierId().getUserId().equals(supplier.getUserId())))
            throw new UnauthorizedUserAccessException();

        // FIXME DISABLED ONLY FOR TESTING!
        // if (LocalDate.now().isAfter(postulation.getStartDate()))
        // postulation.setStartDate(LocalDate.now());

        postulation.setStatus(PostulationStatusEnum.ACCEPTED);

        if (isWorkLastPostulation(postulation.getWork()))
            postulations.saveAll(rejectExtraPendingPostulations(postulation.getWork(), postulation));

        createInstanceFromPostulation(postulation);
        postulations.save(postulation);
    }

    /**
     * Checks if a work next postulation to accept is the last one available
     * 
     * @param work Work to check
     * @return true if a work is only able to accept a single postulation. false
     *         otherwise
     */
    private boolean isWorkLastPostulation(WorkEntity work) {
        Long curInstances = workInstances.countByWorkId(work);
        return work.getVolunteersNeeded().equals(curInstances + 1l);
    }

    /**
     * Rejects all the pendings postulation of a work after a last postulation is
     * accepted.
     * 
     * @param work            Work to reject its postulation
     * @param lastPostulation Last postulation accepted
     * @return List of all the postulations rejected
     */
    private List<PostulationEntity> rejectExtraPendingPostulations(WorkEntity work,
            PostulationEntity lastPostulation) {

        Stream<PostulationEntity> toReject = work.getWorkPostulations().stream()
                .filter((p) -> p.getStatus().equals(PostulationStatusEnum.PENDING));

        return toReject.map((p) -> {
            p.setStatus(PostulationStatusEnum.REJECTED);
            return p;
        }).toList();
    }

    /**
     * Retrieves all the pending postulations from a work.
     * 
     * @param supplier Supplier of the job
     * @param workId   Work id
     * @return List of all the pending postulations from a work
     */
    public List<PostulationDTO> getWorkPendingPostulations(UserEntity supplier, Long workId) {

        WorkEntity work = works.findById(workId).orElse(null);
        if (work == null)
            throw new NonExistentWorkException();

        if (!work.getSupplierId().getUserId().equals(supplier.getUserId()))
            throw new UnauthorizedUserAccessException();

        Set<PostulationEntity> pendingPostulations = postulations.findByWorkAndStatus(work,
                PostulationStatusEnum.PENDING);

        List<PostulationDTO> responses = new ArrayList<>();
        for (PostulationEntity pending : pendingPostulations) {
            UserEntity volunteer = pending.getVolunteer();
            WorkDTO workDTO = WorkDTO.builder()
                    .id(work.getWorkId())
                    .name(work.getName())
                    .supplierUsername(work.getSupplierId().getUserName())
                    .build();

            responses.add(PostulationDTO.builder()
                    .postulationId(pending.getPostulationId())
                    .status(pending.getStatus())
                    .startDate(pending.getStartDate())
                    .endDate(pending.getEndDate())
                    .volunteerUsername(volunteer.getUserName())
                    .volunteerFullname(volunteer.getName())
                    .work(workDTO)
                    .build());
        }
        return responses;
    }

    /**
     * Get all the works that have a pending postulation in a paginated fashion
     * 
     * @param supplier Supplier to get works from
     * @param page     Page of the postulations
     * @param pageSize Page size of the postulations
     * @return A list of works with pending postulations from the supplier
     */
    public List<WorkDTO> getPaginatedWorksWithPendingPostulations(UserEntity supplier, Integer page,
            Integer pageSize) {
        List<PostulationEntity> pendingPostulations = postulations.findByWorkSupplierIdAndStatus(supplier,
                PostulationStatusEnum.PENDING, PageRequest.of(page, pageSize));

        List<WorkEntity> distinctWork = pendingPostulations
                .stream()
                .map((p) -> p.getWork())
                .distinct()
                .toList();

        List<WorkDTO> responses = new ArrayList<>();

        for (WorkEntity work : distinctWork) {
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
                    .tags(tags)
                    .hours(blocks)
                    .supplierName(supplier.getName())
                    .supplierUsername(supplier.getUserName())
                    .build());
        }

        return responses;
    }

    /**
     * Creates a work instance and its sessions from a postulation AÑADIDO
     * 
     * @param postulation Postulation to create work instance and sessions from
     */
    @Transactional
    private void createInstanceFromPostulation(PostulationEntity postulation) {

        WorkInstanceEntity workInstance = new WorkInstanceEntity(postulation.getStartDate(), postulation.getEndDate(),
                postulation.getWork(), postulation.getVolunteer());

        Set<WorkSessionEntity> sessions = createSessions(postulation.getStartDate(),
                postulation.getEndDate(), workInstance);

        workInstances.save(workInstance);
        workSessions.saveAll(sessions);
    }

    /**
     * Creates all the sessions of the work instance between two dates AÑADIDO
     * 
     * @param from Start of the sessions
     * @param to   End of the sessions
     * @return Set of all the work sessions for the work instance between the two
     *         dates
     */
    private Set<WorkSessionEntity> createSessions(LocalDate from, LocalDate to, WorkInstanceEntity workInst) {

        LinkedHashSet<WorkSessionEntity> sessions = new LinkedHashSet<WorkSessionEntity>();

        if (workInst.getWorkId().getType().equals(ModelsConstants.WORK_TYPE_SESSION)) {
            for (WorkHourBlocks hBlocks : workInst.getWorkId().getWorkHourBlocks()) {
                sessions.add(new WorkSessionEntity(workInst.getWorkId().getStartDate().getDayOfWeek().getValue() % 7,
                        workInst.getWorkId().getStartDate(),
                        hBlocks.getHourBlock(), workInst));
            }

            return sessions;
        }

        LocalDate curWeek = from.with(DayOfWeek.MONDAY);
        while (curWeek.isBefore(to) || curWeek.isEqual(to)) {
            for (WorkHourBlocks hBlocks : workInst.getWorkId().getWorkHourBlocks()) {

                LocalDate auxDate = curWeek.plusDays((hBlocks.getWeekDay() - 1) % 7);
                Integer auxWeekDay = (auxDate.getDayOfWeek().getValue()) % 7;
                if ((auxDate.isAfter(from) || auxDate.isEqual(from)) &&
                        (auxDate.isBefore(to) || auxDate.isEqual(to))
                        && (hBlocks.getWeekDay().equals(auxWeekDay))) {

                    sessions.add(new WorkSessionEntity(hBlocks.getWeekDay(), auxDate,
                            hBlocks.getHourBlock(), workInst));
                }
            }
            curWeek = curWeek.plusWeeks(1);
        }

        return sessions;
    }
}
