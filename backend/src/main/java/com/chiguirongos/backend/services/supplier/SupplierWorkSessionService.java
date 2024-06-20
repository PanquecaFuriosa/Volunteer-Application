package com.chiguirongos.backend.services.supplier;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.chiguirongos.backend.dtos.requestsDTO.WorkBlockDTO;
import com.chiguirongos.backend.dtos.responsesDTO.WorkSessionDTO;
import com.chiguirongos.backend.exceptions.runtime.NonExistentWorkSessionException;
import com.chiguirongos.backend.exceptions.runtime.SessionNotInPastException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedRoleException;
import com.chiguirongos.backend.exceptions.runtime.UnauthorizedUserAccessException;
import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.utils.ModelsConstants;
import com.chiguirongos.backend.models.utils.WorkSessionStatusEnum;
import com.chiguirongos.backend.models.works.WorkSessionEntity;
import com.chiguirongos.backend.repositories.WorkSessionRepository;

@Service
public class SupplierWorkSessionService {

    @Autowired
    private WorkSessionRepository sessions;

    /**
     * Changes the status of a work's session
     * by a supplier
     * 
     * @param supplierUsername Supplier creator of the session
     * @param sessionId        Session id
     * @param newStatus        New status of the session
     */
    public void changeSessionStatus(UserEntity supplier, Long sessionId, WorkSessionStatusEnum newStatus) {

        WorkSessionEntity wSession = sessions.findById(sessionId).orElse(null);
        if (wSession == null)
            throw new NonExistentWorkSessionException();

        if (!supplier.getRole().equals(ModelsConstants.SUPPLIER_ROLE))
            throw new UnauthorizedRoleException();

        if (!wSession.getWorkInst().getWorkId().getSupplierId().getUserId().equals(supplier.getUserId()))
            throw new UnauthorizedUserAccessException();

        if (wSession.getSessionDate().isAfter(LocalDate.now()))
            throw new SessionNotInPastException();

        wSession.setStatus(newStatus);
        sessions.save(wSession);
    }

    /**
     * Gets the work sessions from a supplier work in a date and hour block.
     * 
     * @param supplierUsername JWT auth of the rejecting supplier
     * @param workInfo         DTO containing work id, hour block and date to
     *                         retrieve
     *                         sessions from
     * @return List of work sessions DTOs containing its id, status, week day, date
     *         and time
     */
    public List<WorkSessionDTO> getWorkSessionsByBlock(UserEntity supplier, WorkBlockDTO workInfo) {

        Set<WorkSessionEntity> allSessions = sessions.findWorkSessionsInBlock(workInfo.getWorkId(),
                workInfo.getBlockDate(), workInfo.getBlockTime());

        return allSessions
                .stream()
                .map((ws) -> {
                    UserEntity volunteer = ws.getWorkInst().getVolunteerId();
                    return WorkSessionDTO.builder()
                            .id(ws.getId())
                            .status(ws.getStatus())
                            .date(ws.getSessionDate())
                            .time(ws.getSessionTime())
                            .volunteerFullname(volunteer.getName())
                            .volunteerUsername(volunteer.getUserName())
                            .build();
                }).toList();
    }
}
