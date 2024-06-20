package com.chiguirongos.backend.repositories;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import com.chiguirongos.backend.models.users.UserEntity;
import com.chiguirongos.backend.models.works.WorkInstanceEntity;
import com.chiguirongos.backend.models.works.WorkSessionEntity;

/**
 * Repository interface for managing the sessions of work instances
 * Provides methods to saving and retrieving WorkSession objects
 */
public interface WorkSessionRepository extends CrudRepository<WorkSessionEntity, Long> {

    Set<WorkSessionEntity> findByWorkInstIn(Set<WorkInstanceEntity> workInst);

    void removeByWorkInst(WorkInstanceEntity workInst);

    /**
     * Retrieves all the work sessions from a work in certain date and time
     * 
     * @param workId Work to get sessions from
     * @param date   Date from the sessions to get
     * @param time   Time from the sessions to get
     * @return Set of work sessions within the date and time parameters, and
     *         associated to the work with workId
     */
    @Query("""
            select ws
            from WorkSessionEntity as ws
            join ws.workInst as wi
                where wi.workId.workId = ?1 and
                      ws.sessionDate = ?2 and
                      ws.sessionTime = ?3
            """)
    Set<WorkSessionEntity> findWorkSessionsInBlock(Long workId, LocalDate date, LocalTime time);

    /**
     * Finds all the work sessions of a volunteer between two dates
     * 
     * @param volunteer Volunteer to get sessions from
     * @param start     Start date of the range of work sessions to get
     * @param end       End date of the range of work sessions to get
     * @return Set of work sessions from a volunteer between two dates
     */
    @Query("""
            select ws
            from WorkSessionEntity as ws
            join ws.workInst as wi
                where wi.volunteerId = ?1 and
                      ws.sessionDate >= ?2 and
                      ws.sessionDate <= ?3
            """)
    Set<WorkSessionEntity> findVolunteerWorkSessionsBetweenDates(
            UserEntity volunteer,
            LocalDate start,
            LocalDate end);

    /**
     * Finds all the work's sessions related to a supplier between two dates and
     * sorts them first by session date and then by session time
     * 
     * @param supplier Volunteer to get sessions from
     * @param start    Start date of the range of work sessions to get
     * @param end      End date of the range of work sessions to get
     * @return Set of work sessions realted to a supplier between two dates
     */
    @Query("""
            select ws
            from WorkSessionEntity as ws
            join ws.workInst as wi
                where wi.workId.supplierId.userName in ?1 and
                ws.sessionDate >= ?2 and
                ws.sessionDate <= ?3
            order by wi.workId.name, ws.sessionDate, ws.sessionTime asc
            """)
    Set<WorkSessionEntity> findSupplierWorkSessionBetweenDatesOrderByDateAndTime(
            List<String> suppliers,
            LocalDate start,
            LocalDate end);

    /**
     * Finds all the work sessions of a volunteer between two dates and
     * sorts them first by session date and then by session time
     * 
     * @param volunteers Volunteers to get sessions from
     * @param start      Start date of the range of work sessions to get
     * @param end        End date of the range of work sessions to get
     * @return Set of work sessions from a volunteer between two dates
     */
    @Query("""
            select ws
            from WorkSessionEntity as ws
            join ws.workInst as wi
                where wi.volunteerId.userName in ?1 and
                      ws.sessionDate >= ?2 and
                      ws.sessionDate <= ?3
            order by wi.workId.name, ws.sessionDate, ws.sessionTime asc
            """)
    Set<WorkSessionEntity> findVolunteerWorkSessionsBetweenDatesOrderByDateAndTime(
            List<String> volunteers,
            LocalDate start,
            LocalDate end);
}
